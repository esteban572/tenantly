import { supabase } from './supabaseClient';
import type { Profile } from './profileService';

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  participant1?: Profile;
  participant2?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  read_at?: string;
  created_at: string;
}

export const conversationService = {
  /**
   * Get or create a conversation between two users
   * Checks if a conversation already exists, creates one if not
   */
  async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    try {
      // Check if conversation already exists (in either direction)
      const { data: existing, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${userId1},participant2_id.eq.${userId2}),and(participant1_id.eq.${userId2},participant2_id.eq.${userId1})`)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant1_id: userId1,
          participant2_id: userId2
        })
        .select('id')
        .single();

      if (createError) throw createError;
      
      return newConversation.id;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      throw error;
    }
  },

  /**
   * Get all conversations for a user with participant details
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!participant1_id(*),
          participant2:profiles!participant2_id(*)
        `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Conversation[];
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      throw error;
    }
  },

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!participant1_id(*),
          participant2:profiles!participant2_id(*)
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      return data as Conversation;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  },

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data as Message[];
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      return data as Message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  /**
   * Mark all messages in a conversation as read for the current user
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  },

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('read', false);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Get unread message count per conversation for a user
   */
  async getUnreadCountByConversation(userId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('receiver_id', userId)
        .eq('read', false);

      if (error) throw error;

      // Count messages per conversation
      const counts: Record<string, number> = {};
      data?.forEach((msg: any) => {
        if (msg.conversation_id) {
          counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
        }
      });

      return counts;
    } catch (error) {
      console.error('Error fetching unread counts by conversation:', error);
      return {};
    }
  },

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToConversation(conversationId: string, callback: (message: Message) => void) {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Subscribe to message read status updates
   */
  subscribeToMessageUpdates(conversationId: string, callback: (message: Message) => void) {
    const channel = supabase
      .channel(`conversation-updates:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: any) {
    if (channel) {
      await supabase.removeChannel(channel);
    }
  },

  /**
   * Get the other participant in a conversation
   */
  getOtherParticipant(conversation: Conversation, currentUserId: string): Profile | null {
    if (!conversation.participant1 || !conversation.participant2) {
      return null;
    }

    return conversation.participant1_id === currentUserId
      ? conversation.participant2
      : conversation.participant1;
  }
};
