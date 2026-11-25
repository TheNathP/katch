create table public.avatar_backgrounds (
  id text primary key check (id ~ '^[a-z]+$'),
  hex text not null check (hex ~ '^#[0-9A-F]{6}$'),
  label text not null,
  position smallint not null unique
);

create table public.avatars (
  id text primary key check (id ~ '^[a-z]+(-[a-z]+)*$'),
  storage_path text not null unique,
  position smallint not null unique
);

alter table public.avatar_backgrounds enable row level security;
alter table public.avatars enable row level security;

revoke all on public.avatar_backgrounds, public.avatars from public, anon, authenticated;
grant select on public.avatar_backgrounds, public.avatars to service_role;

insert into public.avatar_backgrounds (id, hex, label, position) values
  ('lime',     '#DEFA06', 'Vert citron électrique', 1),
  ('aqua',     '#00FAFD', 'Cyan',                   2),
  ('coral',    '#FF6338', 'Orange corail',          3),
  ('fuchsia',  '#FF0877', 'Rose fuchsia',           4),
  ('violet',   '#6016E8', 'Violet électrique',      5),
  ('amethyst', '#B52AFF', 'Violet améthyste',       6),
  ('sky',      '#48C9EF', 'Bleu ciel',              7),
  ('blush',    '#DAC6BE', 'Beige rosé',             8),
  ('charcoal', '#1B1813', 'Noir anthracite',        9);

insert into public.avatars (id, storage_path, position) values
  ('happy',              'happy.png',              1),
  ('happy-rose',         'happy-rose.png',         2),
  ('excited',            'excited.png',            3),
  ('excited-amber',      'excited-amber.png',      4),
  ('confident',          'confident.png',          5),
  ('confident-aqua',     'confident-aqua.png',     6),
  ('confident-coral',    'confident-coral.png',    7),
  ('star-eyes',          'star-eyes.png',          8),
  ('star-eyes-amethyst', 'star-eyes-amethyst.png', 9),
  ('running',            'running.png',            10),
  ('sleeping',           'sleeping.png',           11),
  ('sad',                'sad.png',                12),
  ('comic-win',          'comic-win.png',          13),
  ('comic-miss',         'comic-miss.png',         14);

-- Public bucket: anyone can read the images by URL. No storage policy, so
-- only the service role (migrations, CLI) can upload or delete them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/png'])
on conflict (id) do nothing;

-- Player's choice ----------------------------------------------------------

-- Existing profiles get the defaults.
alter table public.social_profiles
  add column avatar_id text not null default 'happy'
    references public.avatars (id),
  add column avatar_background_id text not null default 'violet'
    references public.avatar_backgrounds (id);

-- Display names are unique regardless of case and surrounding spaces.
create unique index social_profiles_display_name_unique
  on public.social_profiles (lower(btrim(display_name)));

create or replace function public.create_social_profile()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.social_profiles (player_id, display_name, avatar_id, avatar_background_id)
  values (
    new.id,
    coalesce(
      nullif(btrim(metadata ->> 'display_name'), ''),
      'Pix-' || left(replace(new.id::text, '-', ''), 12)
    ),
    coalesce(metadata ->> 'avatar', 'happy'),
    coalesce(metadata ->> 'avatar_background', 'violet')
  );
  return new;
end;
$$;

revoke all on function public.create_social_profile() from public, anon, authenticated;
