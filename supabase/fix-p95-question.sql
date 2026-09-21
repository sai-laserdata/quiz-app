-- Content fix, not a schema migration. Questions live in the database, so this
-- cannot be fixed by deploying code.
--
-- The question "A p95 latency spike usually indicates what?" is a duplicate of
-- the p99 question with the options shuffled, and its answer key is wrong: it
-- is marked A ("Only the median is slow") when the correct answer is
-- "Tail requests are experiencing delays". Anyone who understands percentiles
-- is currently told they are wrong.
--
-- Run ONE of the two options below.

-- ---------------------------------------------------------------------------
-- OPTION A (recommended): replace it. Removes the duplicate and ties the quiz
-- to the 0.9.0 release that shipped today.
-- ---------------------------------------------------------------------------
update public.questions
set
  prompt = 'Apache Iggy 0.9.0 added clustering. Which consensus protocol does it use?',
  option_a = 'Raft',
  option_b = 'Viewstamped Replication Revisited (VSR)',
  option_c = 'Two-phase commit',
  option_d = 'Gossip with eventual consistency',
  correct_option = 'B'
where prompt = 'A p95 latency spike usually indicates what?';

-- ---------------------------------------------------------------------------
-- OPTION B (minimal): keep the question, just correct the key. Note this leaves
-- a near-duplicate of the p99 question in the pool.
-- ---------------------------------------------------------------------------
-- update public.questions
-- set correct_option = 'D'
-- where prompt = 'A p95 latency spike usually indicates what?';

-- Verify afterwards:
-- select position, prompt, correct_option from public.questions order by position;
