-- Enable RLS on all tables
-- Create Profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text check (role in ('landlord', 'tenant')),
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create Properties table
create table properties (
  id uuid default uuid_generate_v4() primary key,
  landlord_id uuid references profiles(id) not null,
  title text not null,
  description text,
  price numeric not null,
  address text not null,
  image_urls text[], -- Array of text for image URLs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table properties enable row level security;

create policy "Properties are viewable by everyone"
  on properties for select
  using ( true );

create policy "Landlords can insert their own properties"
  on properties for insert
  with check ( auth.uid() = landlord_id );

create policy "Landlords can update their own properties"
  on properties for update
  using ( auth.uid() = landlord_id );

create policy "Landlords can delete their own properties"
  on properties for delete
  using ( auth.uid() = landlord_id );

-- Create Tenancies table
create table tenancies (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) not null,
  tenant_id uuid references profiles(id) not null,
  start_date date not null,
  end_date date,
  status text check (status in ('active', 'pending', 'ended')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table tenancies enable row level security;

create policy "Tenants can view their own tenancies"
  on tenancies for select
  using ( auth.uid() = tenant_id );

create policy "Landlords can view tenancies for their properties"
  on tenancies for select
  using ( 
    exists (
      select 1 from properties 
      where properties.id = tenancies.property_id 
      and properties.landlord_id = auth.uid()
    )
  );

-- Create Messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) not null,
  receiver_id uuid references profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;

create policy "Users can view messages sent to or from them"
  on messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

create policy "Users can insert messages sent by them"
  on messages for insert
  with check ( auth.uid() = sender_id );

-- Create Maintenance Requests table
create table maintenance_requests (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references profiles(id) not null,
  property_id uuid references properties(id) not null,
  title text not null,
  description text,
  status text check (status in ('pending', 'in_progress', 'completed', 'cancelled')) default 'pending',
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table maintenance_requests enable row level security;

create policy "Tenants can view their own maintenance requests"
  on maintenance_requests for select
  using ( auth.uid() = tenant_id );

create policy "Landlords can view maintenance requests for their properties"
  on maintenance_requests for select
  using (
    exists (
      select 1 from properties
      where properties.id = maintenance_requests.property_id
      and properties.landlord_id = auth.uid()
    )
  );

create policy "Tenants can insert maintenance requests for their properties"
  on maintenance_requests for insert
  with check ( auth.uid() = tenant_id );
