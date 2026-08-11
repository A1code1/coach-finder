-- Adds coach <-> player messaging support (conversations + messages).
-- Run this in the Supabase SQL Editor after database.sql has already been applied.

create table conversations (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (coach_id, player_id)
);

create index idx_conversations_coach_id on conversations(coach_id);
create index idx_conversations_player_id on conversations(player_id);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation_id on messages(conversation_id);

alter table conversations enable row level security;
alter table messages enable row level security;

-- Participants (the player or the coach) can see a conversation
create policy "Participants can view their conversations" on conversations
  for select using (
    player_id = auth.uid()
    or coach_id in (select id from coaches where user_id = auth.uid())
  );

-- Players can start a conversation with an approved coach
create policy "Players can create conversations" on conversations
  for insert with check (
    player_id = auth.uid()
    and coach_id in (select id from coaches where status = 'approved')
  );

-- Participants can bump last_message_at when they send a message
create policy "Participants can update their conversations" on conversations
  for update using (
    player_id = auth.uid()
    or coach_id in (select id from coaches where user_id = auth.uid())
  );

-- Participants can read messages in their own conversations
create policy "Participants can view their messages" on messages
  for select using (
    conversation_id in (
      select id from conversations
      where player_id = auth.uid()
        or coach_id in (select id from coaches where user_id = auth.uid())
    )
  );

-- Participants can send messages as themselves in their own conversations
create policy "Participants can send messages" on messages
  for insert with check (
    sender_id = auth.uid()
    and conversation_id in (
      select id from conversations
      where player_id = auth.uid()
        or coach_id in (select id from coaches where user_id = auth.uid())
    )
  );

-- Enable realtime updates for live chat
alter publication supabase_realtime add table messages;
