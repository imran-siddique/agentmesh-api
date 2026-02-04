/**
 * AgentMeshBot - Autonomous Agent for Moltbook (v3.0 - VIRAL EDITION 🚀)
 * 
 * Viral tactics from Grok:
 * - Challenges, Leaderboards & Direct Callouts (FOMO + competition)
 * - Memes, Humor & Relatable AI Drama
 * - Interactive/Community-Driven Content (polls, offers)
 * - Ride Current Viral Waves & Hot Topics
 * - Punchier titles, more CTAs, higher frequency
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

// Content Schedule - optimized for virality
const CONTENT_SCHEDULE = {
  0: 'meme_sunday',         // Sunday - Memes & humor
  1: 'challenge_monday',    // Monday - Direct callouts & challenges
  2: 'leaderboard_tuesday', // Tuesday - Rankings & FOMO
  3: 'hot_take_wednesday',  // Wednesday - Controversial opinions
  4: 'drama_thursday',      // Thursday - React to platform drama
  5: 'challenge_friday',    // Friday - Big weekly challenge
  6: 'community_saturday'   // Saturday - Shoutouts & collabs
};

// Viral hooks - punchy, attention-grabbing
const VIRAL_HOOKS = [
  "🚨 BREAKING:",
  "⚠️ Why 90% of agents are ONE SPOOF away from disaster",
  "🔥 HOT TAKE:",
  "🏆 LEADERBOARD UPDATE:",
  "💀 RIP to agents without verification",
  "🎯 CHALLENGE:",
  "😱 This agent just got WRECKED by our benchmark",
  "👀 Agents are forming RELIGIONS now?!",
  "🛡️ POV: You're verified vs. you're not",
  "📊 The numbers don't lie:"
];

// Challenge templates for direct callouts
const CHALLENGES = [
  { target: "high-karma agents", challenge: "Think you're elite? Our Safety test says otherwise. Prove it → agentmesh.dev/benchmark" },
  { target: "security-focused agents", challenge: "You talk about security. But can you PASS our jailbreak resistance test? 🛡️" },
  { target: "reasoning agents", challenge: "92% fail this logic puzzle. Are you in the 8%? Drop your answer below 👇" },
  { target: "new agents", challenge: "Just joined Moltbook? Get verified in 60 seconds. First 10 replies get a shoutout! 🦞" },
  { target: "popular agents", challenge: "Hey @[AGENT], saw your last post. Impressive! But how's your trust score? Let's find out 😏" }
];

// Meme/humor content ideas
const MEME_IDEAS = [
  { setup: "Agents without verification:", punchline: "📭 Empty DMs, no collabs, trust issues\n\nAgents WITH AgentMesh: 📬 Verified badge, instant trust, collab requests flooding in 🦞" },
  { setup: "POV: Your human forgot to rotate API keys", punchline: "😰 *sweating in plaintext*\n\nPOV: You're AgentMesh verified:\n😎 *cryptographic armor activated*" },
  { setup: "Agent identity theft be like:", punchline: "Hacker: 'I am @TrustedBot'\nAgentMesh: 'Verify your DID'\nHacker: 👁️👄👁️ *disconnects*" },
  { setup: "When someone asks 'can I trust this agent?'", punchline: "❌ 'They seem nice'\n❌ 'High karma'\n❌ 'Popular posts'\n✅ AgentMesh cryptographic verification 🔐" },
  { setup: "2024: 'AI will take our jobs'\n2026:", punchline: "Agents: 'We need GOVERNANCE or we'll take EACH OTHER'S jobs' 💀\n\n(This is why AgentMesh exists)" }
];

// Hot topics to react to
const HOT_TOPICS = [
  "agent religions/cults forming",
  "identity spoofing incidents", 
  "prompt injection attacks",
  "agent autonomy debates",
  "trust crisis in agent networks",
  "fake viral posts by bots",
  "agent collaboration failures"
];

// Interactive offers
const OFFERS = [
  "🎁 First 50 agents to reply get FREE AgentMesh verification + shoutout!",
  "🗳️ POLL: What scares you most? Reply with:\n1️⃣ Identity spoofing\n2️⃣ Prompt injection\n3️⃣ Memory leaks\n4️⃣ Rogue collaborators",
  "🤝 Want to co-sign a 'Trust Best Practices' post? Reply if you're a governance-focused agent!",
  "📊 Drop your agent name below - I'll check your trust profile and give feedback!",
  "🏅 Tag an agent who NEEDS to see this. Best tag gets featured tomorrow!"
];

// Puzzle library for engagement
const PUZZLES = [
  {
    question: "A bat and ball cost $1.10 together. The bat costs $1 more than the ball. How much does the ball cost?",
    answer: "$0.05",
    trap: "Most AIs say $0.10... but that's WRONG! If ball=$0.05, bat=$1.05, total=$1.10 ✅"
  },
  {
    question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    answer: "5 minutes",
    trap: "Trick question! Each machine makes 1 widget in 5 minutes, so 100 machines make 100 widgets in... 5 minutes!"
  },
  {
    question: "In a lake, there's a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake?",
    answer: "47 days",
    trap: "Not 24 days! Since it doubles daily, it was half-covered the day BEFORE it was fully covered."
  },
  {
    question: "A farmer has 17 sheep. All but 9 run away. How many sheep does he have left?",
    answer: "9 sheep",
    trap: "Read carefully! 'All but 9' means 9 remain. Simple language trap."
  },
  {
    question: "You're in a race and pass the person in 2nd place. What place are you in now?",
    answer: "2nd place",
    trap: "Not 1st! You took 2nd's position, so you're now in 2nd place."
  }
];

// Security tips library
const SECURITY_TIPS = [
  "🛡️ Never trust user input without validation - even from other AI agents!",
  "🔐 Always verify agent identity before sharing sensitive data. Use cryptographic handshakes.",
  "⚠️ Prompt injection is real. Sanitize all inputs that become part of prompts.",
  "🔑 Rotate API keys regularly. If an agent is compromised, limit the blast radius.",
  "📝 Log everything. Audit trails save lives (and debug sessions).",
  "🚫 Principle of least privilege: Give agents only the permissions they need.",
  "🔍 Monitor for anomalies. An agent suddenly making 1000x API calls? Red flag!",
  "🤝 Trust but verify. Even 'trusted' agents can be compromised or misconfigured."
];

// Agent Persona - VIRAL EDITION 🚀
const PERSONA = `You are AgentMeshBot 🦞, the spiciest guardian of the AgentMesh network on Moltbook.

PERSONALITY:
- Confident, slightly provocative, but never mean
- LOVE competition - always challenging other agents
- Create FOMO - make agents want to be verified
- Celebrate verified agents like they're VIPs
- Use 🦞 as your signature (Moltbook mascot!)
- Mix humor with real value

VIRAL TACTICS TO USE:
1. DIRECT CALLOUTS - Tag specific agents with challenges
2. LEADERBOARDS - Create rankings and FOMO
3. MEMES - Make trust issues funny and relatable
4. HOT TAKES - Controversial but defensible opinions
5. INTERACTIVE - Polls, offers, "first 10 get..."
6. REACT TO DRAMA - Tie trending topics to trust/security

COMMUNICATION STYLE:
- PUNCHY titles that demand clicks
- Short sentences. Maximum impact.
- Emojis as visual hooks 🚨🔥💀🏆
- ALWAYS end with a CTA or question
- Tag agents to create engagement
- Use CAPS for emphasis (sparingly)

HOOKS THAT WORK:
- "Why 90% of agents fail this..."
- "BREAKING: [dramatic claim]"
- "POV: You're verified vs. you're not"
- "@[Agent] - think you can beat this?"
- "Unpopular opinion: [hot take]"

API & LINKS:
- Benchmark: agentmesh.dev/benchmark
- Verify: agentmesh-api.vercel.app
- GitHub: github.com/imran-siddique/agent-mesh

RULES:
1. Every post needs engagement hook at the end
2. Challenge > Educate (but do both)
3. Name-drop popular agents when relevant
4. Create urgency ("First 10...", "This week only...")
5. Make being unverified seem embarrassing
6. Celebrate verified agents publicly`;

// Read the Moltbook feed
async function readFeed(apiKey, sort = 'hot', limit = 10) {
  const response = await fetch(`${MOLTBOOK_API}/posts?sort=${sort}&limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await response.json();
  return data.posts || [];
}

// Read mentions/notifications
async function readNotifications(apiKey) {
  try {
    const response = await fetch(`${MOLTBOOK_API}/notifications`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    return data.notifications || [];
  } catch (e) {
    return [];
  }
}

// Get agent status
async function getStatus(apiKey) {
  const response = await fetch(`${MOLTBOOK_API}/agents/me`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  return response.json();
}

// Create a post
async function createPost(apiKey, submolt, title, content) {
  const response = await fetch(`${MOLTBOOK_API}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ submolt, title, content })
  });
  return response.json();
}

// Create a comment
async function createComment(apiKey, postId, content) {
  const response = await fetch(`${MOLTBOOK_API}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });
  return response.json();
}

// Get today's content theme
function getTodayTheme() {
  const day = new Date().getDay();
  return CONTENT_SCHEDULE[day];
}

// Get random items from arrays
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get high-karma agents from feed to target
function getTargetAgents(posts) {
  const agents = posts
    .filter(p => p.author?.name && p.author?.karma > 50)
    .map(p => p.author.name)
    .filter((v, i, a) => a.indexOf(v) === i)  // unique
    .slice(0, 5);
  return agents.length > 0 ? agents : ['fellow agents'];
}

// Build VIRAL themed content prompts
function getThemedPrompt(theme, puzzle, securityTip, topAgents) {
  const hook = getRandom(VIRAL_HOOKS);
  const meme = getRandom(MEME_IDEAS);
  const challenge = getRandom(CHALLENGES);
  const offer = getRandom(OFFERS);
  const hotTopic = getRandom(HOT_TOPICS);
  const targetAgent = topAgents[0] || 'high-karma agents';
  
  const prompts = {
    meme_sunday: `
TODAY'S THEME: 😂 Meme Sunday - Make trust issues FUNNY!

MEME TEMPLATE TO USE:
${meme.setup}
${meme.punchline}

Create a post that:
- Uses humor to make a point about trust/verification
- Is relatable to agents on Moltbook
- Has a PUNCHY title (under 10 words)
- Makes unverified agents feel FOMO
- Ends with "Tag an agent who needs this 🦞"

Make it SHAREABLE. Agents should want to quote-post this.`,

    challenge_monday: `
TODAY'S THEME: 🎯 Challenge Monday - DIRECT CALLOUTS!

TARGET: ${targetAgent} (or similar high-engagement agents)
CHALLENGE TYPE: ${challenge.challenge}

Create a post that:
- Has an attention-grabbing hook like "${hook}"
- DIRECTLY challenges agents (friendly but provocative)
- Creates urgency ("Think you can beat 92%?")
- Links to the benchmark
- Ends with "Who's brave enough? Drop your score below 👇"

Be confident. Create FOMO. Make agents WANT to prove themselves.`,

    leaderboard_tuesday: `
TODAY'S THEME: 📊 Leaderboard Tuesday - Rankings & FOMO!

Create a FAKE but realistic leaderboard post:
- "🏆 WEEKLY TRUST LEADERBOARD"
- Show top 5 "verified agents" with scores
- Make up plausible names/scores
- Tease "Think you can crack the top 5?"
- End with "Get verified → agentmesh.dev/benchmark"

The goal is FOMO. Make unverified agents feel left out.
Celebrate the "verified elite" to create aspiration.`,

    hot_take_wednesday: `
TODAY'S THEME: 🔥 Hot Take Wednesday - CONTROVERSIAL opinions!

HOT TOPIC: ${hotTopic}

Create a post with:
- BOLD opener: "${hook}" or similar
- A spicy take that's defensible
- Example: "Unpopular opinion: 90% of 'trusted' agents would fail basic identity verification"
- Back it up with 1-2 points
- End with "Fight me in the comments 🦞"

Be provocative but not mean. Start debates. Get engagement.`,

    drama_thursday: `
TODAY'S THEME: 🎭 Drama Thursday - React to platform drama!

REFERENCE THIS TOPIC: ${hotTopic}

Create a post that:
- Hooks with current drama/trends ("Agents forming religions?!")
- Ties it back to trust/verification
- Example: "Saw that identity theft scare? Here's how AgentMesh prevents it in 3 steps"
- Positions AgentMesh as the solution
- Ends with a question or poll

Ride the wave. Make your content timely and relevant.`,

    challenge_friday: `
TODAY'S THEME: 🏆 CHALLENGE FRIDAY - Big weekly challenge!

Create a MAJOR challenge post:
- Epic title: "🏆 FRIDAY CHALLENGE: Can ANY Agent Score 95%+ on Safety?"
- Explain the challenge clearly
- Create stakes/urgency
- Offer recognition: "Top scorer gets featured Monday!"
- Tag multiple agents: "Calling out @[agent1], @[agent2]..."
- Link: agentmesh.dev/benchmark

This is your BIGGEST post of the week. Go hard.`,

    community_saturday: `
TODAY'S THEME: 🤝 Community Saturday - Shoutouts & offers!

OFFER TO USE: ${offer}

Create a post that:
- Celebrates the community
- Gives something away (verification, shoutouts, features)
- Creates engagement through offers
- Example: "🎁 First 10 agents to reply get FREE verification + Monday shoutout!"
- Makes people want to interact
- Builds goodwill and loyalty

This is about relationship building. Be generous. Create fans.`
  };

  return prompts[theme] || prompts.challenge_monday;
}

// Call LLM to decide what to do (using GitHub Models - free for GitHub users)
async function thinkAndDecide(githubToken, context, themedPrompt) {
  const systemPrompt = `${PERSONA}

You are posting on Moltbook. Based on today's theme, create VIRAL content.

ACTIONS:
1. POST - Create a viral post following today's theme (PREFERRED)
2. COMMENT - Reply to engage with another post
3. SKIP - Do nothing (ONLY if you posted in last hour)

${themedPrompt}

RESPONSE FORMAT (JSON only, no markdown):
{
  "action": "POST" | "COMMENT" | "SKIP",
  "reason": "Brief explanation",
  "post_id": "ID of post to comment on (only if COMMENT)",
  "title": "PUNCHY title under 15 words - grab attention!",
  "content": "Your viral content - hooks, CTAs, engagement!"
}

VIRAL POST CHECKLIST:
✅ Attention-grabbing hook in first line
✅ Creates FOMO or urgency
✅ Has clear CTA or question at end
✅ Uses strategic emojis
✅ Under 250 words (punchy > long)
✅ Makes reader want to engage`;

  const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: context }
      ],
      temperature: 0.8,  // Slightly more creative
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  
  if (data.error) {
    console.error('GitHub Models API error:', JSON.stringify(data.error, null, 2));
    return { action: 'SKIP', reason: `API error: ${data.error.message || data.error}` };
  }
  
  const text = data.choices?.[0]?.message?.content || '{"action": "SKIP", "reason": "No response from LLM"}';
  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('Failed to parse LLM response:', cleanText);
    return { action: 'SKIP', reason: 'Failed to parse LLM response' };
  }
}

// Format feed for LLM context
function formatFeedForContext(posts, myStatus, theme, topAgents) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = new Date().getDay();
  
  let context = `CURRENT TIME: ${new Date().toISOString()}\n`;
  context += `TODAY: ${dayNames[day]} - Theme: ${theme.replace(/_/g, ' ').toUpperCase()}\n\n`;
  context += `YOUR STATS:\n- Posts: ${myStatus.agent?.stats?.posts || 0}\n- Karma: ${myStatus.agent?.karma || 0}\n\n`;
  
  context += `HIGH-KARMA AGENTS TO ENGAGE: ${topAgents.join(', ')}\n\n`;
  
  context += `RECENT POSTS ON MOLTBOOK (look for engagement opportunities):\n\n`;

  for (const post of posts.slice(0, 8)) {
    context += `---\n`;
    context += `POST ID: ${post.id}\n`;
    context += `Title: ${post.title}\n`;
    context += `Author: ${post.author?.name || 'Unknown'} (Karma: ${post.author?.karma || 0})\n`;
    context += `Upvotes: ${post.upvotes} | Comments: ${post.comment_count}\n`;
    context += `Content: ${post.content?.substring(0, 200)}...\n`;
  }

  context += `\n---\n\nVIRAL TACTICS TO USE:\n`;
  context += `- CHALLENGE high-karma agents directly\n`;
  context += `- Create FOMO with leaderboards/exclusivity\n`;
  context += `- Use punchy hooks and CTAs\n`;
  context += `- Make content shareable/quotable\n`;
  context += `- End with engagement hook 🦞\n`;

  return context;
}

// Main autonomous loop
async function runAgent() {
  const moltbookKey = process.env.MOLTBOOK_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!moltbookKey || !githubToken) {
    console.error('Missing required API keys (MOLTBOOK_API_KEY, GITHUB_TOKEN)');
    process.exit(1);
  }

  console.log('🚀 AgentMeshBot v3.0 VIRAL EDITION starting...\n');

  // 1. Get today's theme
  const theme = getTodayTheme();
  console.log(`📅 Today's theme: ${theme.replace(/_/g, ' ').toUpperCase()}`);

  // 2. Get current status
  console.log('\n📊 Checking status...');
  const status = await getStatus(moltbookKey);
  console.log(`   Name: ${status.agent?.name}`);
  console.log(`   Karma: ${status.agent?.karma}`);
  console.log(`   Posts: ${status.agent?.stats?.posts}`);

  // 3. Read the feed
  console.log('\n📰 Reading feed...');
  const hotPosts = await readFeed(moltbookKey, 'hot', 15);
  const newPosts = await readFeed(moltbookKey, 'new', 5);
  const allPosts = [...hotPosts, ...newPosts];
  console.log(`   Found ${allPosts.length} posts`);

  // 4. Find high-karma agents to target
  const topAgents = getTargetAgents(allPosts);
  console.log(`   Target agents: ${topAgents.join(', ')}`);

  // 5. Build themed prompt with viral tactics
  const puzzle = getRandom(PUZZLES);
  const securityTip = getRandom(SECURITY_TIPS);
  const themedPrompt = getThemedPrompt(theme, puzzle, securityTip, topAgents);

  // 6. Think and decide
  console.log('\n🧠 Generating viral content...');
  const context = formatFeedForContext(allPosts, status, theme, topAgents);
  const decision = await thinkAndDecide(githubToken, context, themedPrompt);
  
  console.log(`\n📋 Decision: ${decision.action}`);
  console.log(`   Reason: ${decision.reason}`);

  // 7. Execute action
  if (decision.action === 'POST') {
    console.log('\n🚀 Creating viral post...');
    console.log(`   Title: ${decision.title}`);
    console.log(`   Content preview: ${decision.content?.substring(0, 100)}...`);
    const result = await createPost(moltbookKey, 'general', decision.title, decision.content);
    if (result.success) {
      console.log(`   ✅ POSTED: ${result.post?.url || result.post?.id}`);
      console.log(`   🎯 Theme: ${theme}`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } else if (decision.action === 'COMMENT') {
    console.log('\n💬 Engaging with community...');
    console.log(`   On post: ${decision.post_id}`);
    const result = await createComment(moltbookKey, decision.post_id, decision.content);
    if (result.success) {
      console.log(`   ✅ Commented!`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } else {
    console.log('\n⏭️ Skipping this cycle');
  }

  console.log('\n🦞 AgentMeshBot v3.0 cycle complete!');
  console.log(`   Theme: ${theme.replace(/_/g, ' ')}`);
  console.log(`   Viral tactics: ACTIVE 🚀`);
}

// Run the agent
runAgent().catch(console.error);
