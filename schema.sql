-- Enable pgvector extension
create extension if not exists vector;

-- Create tables
create table if not exists public.user_settings (
  user_id uuid primary key,
  encrypted_openai_key text,
  updated_at timestamp with time zone default now()
);

alter table public.user_settings enable row level security;

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null, -- 'google-drive', 'slack'
  credentials jsonb not null default '{}'::jsonb,
  status text not null default 'connected',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, provider)
);

alter table public.integrations enable row level security;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  source text not null, -- 'google-drive', 'slack', etc.
  source_id text,
  source_url text,
  file_type text,
  summary text,
  transcript text,
  keywords text[],
  topics text[],
  metadata jsonb default '{}'::jsonb,
  status text not null default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.documents enable row level security;

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  content text not null,
  embedding vector(1536), -- text-embedding-3-small dimension
  chunk_index integer not null,
  created_at timestamp with time zone default now()
);

alter table public.document_chunks enable row level security;

-- Row Level Security policies
create policy "Users can manage their own settings"
  on public.user_settings for all
  using (auth.uid() = user_id);

create policy "Users can manage their own integrations"
  on public.integrations for all
  using (auth.uid() = user_id);

create policy "Users can manage their own documents"
  on public.documents for all
  using (auth.uid() = user_id);

create policy "Users can manage their own document chunks"
  on public.document_chunks for all
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_chunks.document_id
      and d.user_id = auth.uid()
    )
  );

-- Match document chunks function
create or replace function match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  similarity float,
  doc_name text,
  doc_source text,
  doc_url text
)
language plpgsql stable
as $$
begin
  return query
  select
    dc.id as chunk_id,
    dc.document_id,
    dc.content,
    (1 - (dc.embedding <=> query_embedding))::float as similarity,
    d.name as doc_name,
    d.source as doc_source,
    d.source_url as doc_url
  from public.document_chunks dc
  join public.documents d on dc.document_id = d.id
  where d.user_id = filter_user_id
    and (1 - (dc.embedding <=> query_embedding)) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
