-- Demo users for the local Supabase stack. The account used in Expo Go is
-- preview@example.test / KatchPreview2026!.
-- Demo photos are CC0: https://commons.wikimedia.org/wiki/File:Purple_hydrangea.jpg
-- https://commons.wikimedia.org/wiki/File:Bunga_Zinnia_Anggun_Pink.jpg
-- https://commons.wikimedia.org/wiki/File:Zinnia_flowers.jpg
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  account_prefix constant text := '74e943de-33d5-4eff-b92f-';
  viewer_id constant uuid := (account_prefix || '000000000001')::uuid;
  seeded_at constant timestamptz := statement_timestamp();
  challenge_day constant date := (seeded_at at time zone 'UTC')::date;
  day_start constant timestamptz := challenge_day::timestamp at time zone 'UTC';
  demo_player record;
  demo_id uuid;
  demo_email text;
  demo_photos constant text[] := array['hydrangea.jpg', 'pink-zinnia.jpg', 'zinnias.jpg'];
begin
  for demo_player in
    select * from (values
      (1,  'Nathan',                          98.25, 11, false, 'happy',              'violet'),
      (2,  'Léo',                             98.25,  6, true,  'excited-amber',      'lime'),
      (3,  'Chloé',                           95.26,  9, true,  'happy-rose',         'fuchsia'),
      (4,  'Max',                             91.50, 14, true,  'confident-aqua',     'sky'),
      (5,  'CamilleSuperChasseuseDeCouleurs',  89.80,  7, true,  'star-eyes-amethyst', 'amethyst'),
      (6,  'Inès',                            86.35, 15, true,  'running',            'blush'),
      (7,  'Jules',                           78.12, 13, true,  'confident-coral',    'coral'),
      (8,  'Eva',                             99.24,  5, false, 'excited',            'lime'),
      (9,  'Nora',                            99.05, 12, false, 'star-eyes',          'amethyst'),
      (10, 'Hugo',                            96.71,  8, false, 'confident',          'aqua'),
      (11, 'Maya',                            93.44, 10, false, 'happy-rose',         'blush'),
      (12, 'Sami',                            83.91, 17, false, 'sleeping',           'charcoal')
    ) as players(number, display_name, score, capture_order, is_friend, avatar, avatar_background)
  loop
    demo_id := (account_prefix || lpad(demo_player.number::text, 12, '0'))::uuid;
    demo_email := case when demo_id = viewer_id then 'preview@example.test'
                       else 'leaderboard-' || demo_player.number || '@example.test' end;

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, confirmation_token,
      recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', demo_id, 'authenticated', 'authenticated', demo_email,
      case when demo_id = viewer_id then extensions.crypt('KatchPreview2026!', extensions.gen_salt('bf')) end,
      seeded_at, seeded_at, seeded_at, '{"provider":"email","providers":["email"]}', '{}', '', '', '', '', '', ''
    ) on conflict (id) do nothing;

    update public.social_profiles
    set display_name = demo_player.display_name, avatar_id = demo_player.avatar,
        avatar_background_id = demo_player.avatar_background
    where player_id = demo_id;

    insert into public.social_results (player_id, challenge_date, score, captured_at, photo_object_path)
    values (
      demo_id, challenge_day, demo_player.score,
      day_start + (seeded_at - day_start) * demo_player.capture_order / 20,
      demo_photos[1 + (demo_player.number - 1) % cardinality(demo_photos)]
    ) on conflict (player_id, challenge_date) do update
    set score = excluded.score, captured_at = excluded.captured_at, photo_object_path = excluded.photo_object_path;

    if demo_player.is_friend then
      insert into public.friendships (player_a, player_b, requested_by, accepted_at)
      values (viewer_id, demo_id, demo_id, seeded_at)
      on conflict (player_a, player_b) do nothing;
    end if;
  end loop;

  insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
  values (
    viewer_id::text, viewer_id,
    jsonb_build_object('sub', viewer_id, 'email', 'preview@example.test', 'email_verified', true),
    'email', seeded_at, seeded_at
  ) on conflict (provider_id, provider) do nothing;
end;
$$;
