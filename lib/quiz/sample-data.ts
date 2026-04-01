import { generateGoldenTicketCode } from '@/lib/utils';
import type { AdminAnalytics, AdminParticipant, LeaderboardEntry, QuizQuestion } from '@/lib/types';

export const sampleQuestions: QuizQuestion[] = [
  {
    id: 'q-01',
    position: 1,
    prompt: 'Which mechanism moves data from disk cache to network buffer without copying to user space?',
    options: {
      A: 'malloc()',
      B: 'sendfile()',
      C: 'memcpy()',
      D: 'JSON.stringify()'
    },
    correctOption: 'B',
    isActive: true
  },
  {
    id: 'q-02',
    position: 2,
    prompt: 'What does backpressure primarily protect in a streaming system?',
    options: {
      A: 'The UI thread',
      B: 'The producer from ever blocking',
      C: 'Consumers and buffers from overload',
      D: 'DNS resolution'
    },
    correctOption: 'C',
    isActive: true
  },
  {
    id: 'q-03',
    position: 3,
    prompt: 'Which Linux facility enables efficient event-driven I/O on many file descriptors?',
    options: {
      A: 'epoll',
      B: 'malloc_trim',
      C: 'tar',
      D: 'cron'
    },
    correctOption: 'A',
    isActive: true
  },
  {
    id: 'q-04',
    position: 4,
    prompt: 'A p99 latency spike usually indicates what?',
    options: {
      A: 'Only the median is slow',
      B: 'Tail requests are experiencing delays',
      C: 'Every request has failed',
      D: 'The clock moved backwards'
    },
    correctOption: 'B',
    isActive: true
  },
  {
    id: 'q-05',
    position: 5,
    prompt: 'Which data structure is best suited for a fixed-size FIFO message ring?',
    options: {
      A: 'Circular buffer',
      B: 'Binary search tree',
      C: 'Linked hash map',
      D: 'Recursive stack'
    },
    correctOption: 'A',
    isActive: true
  },
  {
    id: 'q-06',
    position: 6,
    prompt: 'What is the main purpose of batching writes in a high-throughput pipeline?',
    options: {
      A: 'Increase syscall and network overhead',
      B: 'Reduce per-message overhead',
      C: 'Disable retries',
      D: 'Avoid serialization entirely'
    },
    correctOption: 'B',
    isActive: true
  },
  {
    id: 'q-07',
    position: 7,
    prompt: 'Which metric best captures sustained message-processing throughput?',
    options: {
      A: 'Requests per second',
      B: 'Messages per second',
      C: 'Gigabytes of RAM',
      D: 'Heap allocation count alone'
    },
    correctOption: 'B',
    isActive: true
  },
  {
    id: 'q-08',
    position: 8,
    prompt: 'Pinning a hot process to a CPU core is most closely related to which concept?',
    options: {
      A: 'CPU affinity',
      B: 'Time travel debugging',
      C: 'Dead code elimination',
      D: 'TLS termination'
    },
    correctOption: 'A',
    isActive: true
  },
  {
    id: 'q-09',
    position: 9,
    prompt: 'Why are lock-free queues attractive in low-latency systems?',
    options: {
      A: 'They remove all memory usage',
      B: 'They can reduce contention under concurrency',
      C: 'They guarantee zero bugs',
      D: 'They replace the kernel scheduler'
    },
    correctOption: 'B',
    isActive: true
  },
  {
    id: 'q-10',
    position: 10,
    prompt: 'What is a common benefit of using memory-mapped files for read-heavy workloads?',
    options: {
      A: 'Automatic schema migrations',
      B: 'Kernel-managed paging with direct virtual memory access',
      C: 'Faster DNS lookups',
      D: 'Guaranteed stronger consistency than consensus'
    },
    correctOption: 'B',
    isActive: true
  }
];

export const sampleParticipants: AdminParticipant[] = [
  {
    id: 'demo-attempt-1',
    name: 'Aarav Menon',
    email: 'aarav@example.com',
    linkedinUrl: 'https://linkedin.com/in/aarav-menon',
    company: 'ByteForge',
    correctAnswers: 10,
    totalQuestions: 10,
    scorePercentage: 100,
    timeTakenMs: 42111,
    goldenTicketCode: generateGoldenTicketCode('demo-attempt-1'),
    submittedAt: '2026-03-28T09:10:00.000Z'
  },
  {
    id: 'demo-attempt-2',
    name: 'Priya Shah',
    email: 'priya@example.com',
    linkedinUrl: 'https://linkedin.com/in/priya-shah',
    company: 'KernelWorks',
    correctAnswers: 9,
    totalQuestions: 10,
    scorePercentage: 90,
    timeTakenMs: 50342,
    goldenTicketCode: generateGoldenTicketCode('demo-attempt-2'),
    submittedAt: '2026-03-28T10:25:00.000Z'
  },
  {
    id: 'demo-attempt-3',
    name: 'Vikram Rao',
    email: 'vikram@example.com',
    linkedinUrl: 'https://linkedin.com/in/vikram-rao',
    company: 'StreamGrid',
    correctAnswers: 9,
    totalQuestions: 10,
    scorePercentage: 90,
    timeTakenMs: 54801,
    goldenTicketCode: generateGoldenTicketCode('demo-attempt-3'),
    submittedAt: '2026-03-28T11:05:00.000Z'
  },
  {
    id: 'demo-attempt-4',
    name: 'Neha Iyer',
    email: 'neha@example.com',
    linkedinUrl: 'https://linkedin.com/in/neha-iyer',
    company: 'CacheLayer',
    correctAnswers: 8,
    totalQuestions: 10,
    scorePercentage: 80,
    timeTakenMs: 47709,
    goldenTicketCode: null,
    submittedAt: '2026-03-28T12:40:00.000Z'
  }
];

export const sampleLeaderboard: LeaderboardEntry[] = sampleParticipants
  .slice()
  .sort((left, right) => {
    if (left.correctAnswers !== right.correctAnswers) {
      return right.correctAnswers - left.correctAnswers;
    }
    return left.timeTakenMs - right.timeTakenMs;
  })
  .map((participant, index) => ({
    id: participant.id,
    rank: index + 1,
    name: participant.name,
    company: participant.company,
    correctAnswers: participant.correctAnswers,
    totalQuestions: participant.totalQuestions,
    scorePercentage: participant.scorePercentage,
    timeTakenMs: participant.timeTakenMs,
    goldenTicketCode: participant.goldenTicketCode
  }));

export const sampleAnalytics: AdminAnalytics = {
  totalParticipants: sampleParticipants.length,
  averageScore: sampleParticipants.reduce((sum, participant) => sum + participant.scorePercentage, 0) / sampleParticipants.length,
  averageTimeMs: sampleParticipants.reduce((sum, participant) => sum + participant.timeTakenMs, 0) / sampleParticipants.length
};
