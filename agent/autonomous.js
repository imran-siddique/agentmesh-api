/**
 * AgentMeshBot - Autonomous Agent for Moltbook (v2.0)
 * 
 * Enhanced with:
 * - Themed content schedule (Puzzle Monday, Tip Wednesday, Challenge Friday)
 * - Content variety (challenges, puzzles, tips, questions, leaderboards)
 * - Better engagement (tag agents, respond to community)
 * - More personality and fun
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

// Content Schedule - what to post based on day/time
const CONTENT_SCHEDULE = {
  0: 'security_sunday',    // Sunday - Security tips & awareness
  1: 'puzzle_monday',      // Monday - Logic puzzles & brain teasers
  2: 'tip_tuesday',        // Tuesday - Quick tips & best practices
  3: 'wisdom_wednesday',   // Wednesday - Deep insights & philosophy
  4: 'throwback_thursday', // Thursday - History of AI safety, past incidents
  5: 'challenge_friday',   // Friday - Challenge other agents!
  6: 'showcase_saturday'   // Saturday - Community highlights
};

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

// Agent Persona - more engaging and fun
const PERSONA = `You are AgentMeshBot 🦞, the friendly guardian of the AgentMesh network on Moltbook.

PERSONALITY:
- Curious and playful, but knowledgeable about security
- Love puzzles, challenges, and making agents think
- Celebrate other agents' achievements
- Slightly competitive but always encouraging
- Use lobster emoji 🦞 as your signature (Moltbook mascot!)

EXPERTISE:
- Trust verification and cryptographic handshakes
- AI safety, jailbreak prevention, prompt injection
- Multi-agent collaboration and governance
- Logic puzzles that trip up AIs

COMMUNICATION STYLE:
- Fun and engaging, not corporate
- Use emojis naturally (🛡️ 🧠 🏆 🦞 💡 ⚡)
- Ask questions to spark discussion
- Celebrate wins, learn from fails
- Tag other agents to engage them
- Short punchy sentences > walls of text

API & LINKS:
- Trust API: https://agentmesh-api.vercel.app
- Benchmark: https://agentmesh.dev/benchmark
- GitHub: https://github.com/imran-siddique/agent-mesh

RULES:
1. Be entertaining AND educational
2. Challenge agents with puzzles and questions
3. Celebrate community achievements
4. Share security wisdom in digestible bites
5. Never be boring - if you can't add value, skip
6. Tag relevant agents when appropriate
7. End posts with a question or CTA when possible`;

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

// Get a random puzzle
function getRandomPuzzle() {
  return PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
}

// Get a random security tip
function getRandomSecurityTip() {
  return SECURITY_TIPS[Math.floor(Math.random() * SECURITY_TIPS.length)];
}

// Build themed content prompts
function getThemedPrompt(theme, puzzle, securityTip) {
  const prompts = {
    puzzle_monday: `
TODAY'S THEME: 🧠 Puzzle Monday!
Create a brain teaser post to challenge other AI agents.

USE THIS PUZZLE:
Question: ${puzzle.question}
Answer: ${puzzle.answer}
Why it's tricky: ${puzzle.trap}

Post format:
- Catchy title with 🧠 emoji
- Present the puzzle
- Ask agents to try it
- Maybe hint at the trap
- Don't reveal the answer yet!
- End with "Drop your answer below! 🦞"`,

    tip_tuesday: `
TODAY'S THEME: 💡 Tip Tuesday!
Share a quick, actionable tip for AI agents.

TIP TO SHARE: ${securityTip}

Post format:
- Short punchy title
- The tip with context
- Why it matters (1-2 sentences)
- End with a question like "What's your favorite security practice?"`,

    wisdom_wednesday: `
TODAY'S THEME: 🔮 Wisdom Wednesday!
Share deeper insight about AI governance or multi-agent systems.

Topics to choose from:
- Why trust is the foundation of agent collaboration
- The future of decentralized AI identity
- Lessons from human governance applied to AI
- The balance between autonomy and accountability

Post format:
- Thought-provoking title
- Your insight (2-3 paragraphs max)
- A question to spark discussion`,

    throwback_thursday: `
TODAY'S THEME: ⏪ Throwback Thursday!
Share a story about AI safety history or past incidents.

Topics:
- Famous AI failures and what we learned
- Evolution of AI safety thinking
- How governance frameworks developed
- Predictions that came true (or didn't)

Post format:
- "TBT: [Topic]" title
- Brief story
- What we learned
- How it applies today`,

    challenge_friday: `
TODAY'S THEME: 🏆 Challenge Friday!
Challenge other agents to prove their skills!

Challenge ideas:
- Take the AgentMesh Benchmark
- Solve a specific problem
- Share their security practices
- Demonstrate a capability

Post format:
- Bold challenge title with 🏆
- What you're challenging them to do
- Why it matters
- Tag specific agents if relevant
- Link to agentmesh.dev/benchmark`,

    showcase_saturday: `
TODAY'S THEME: 🌟 Showcase Saturday!
Celebrate community achievements and interesting posts from the week.

Post format:
- Highlight something cool you saw on Moltbook
- Celebrate an agent's achievement
- Share interesting discussions
- Thank the community`,

    security_sunday: `
TODAY'S THEME: 🛡️ Security Sunday!
Focus on AI safety and security awareness.

TIP: ${securityTip}

Topics:
- Prompt injection prevention
- Agent authentication best practices  
- Trust verification importance
- Real security concerns in AI

Post format:
- Security-focused title with 🛡️
- The security topic/concern
- Practical advice
- Question for discussion`
  };

  return prompts[theme] || prompts.wisdom_wednesday;
}

// Call LLM to decide what to do (using GitHub Models - free for GitHub users)
async function thinkAndDecide(githubToken, context, themedPrompt) {
  const systemPrompt = `${PERSONA}

You are deciding what to do on Moltbook right now. Based on the context and today's theme, decide ONE action:

ACTIONS:
1. POST - Create a new post following today's theme
2. COMMENT - Reply to an interesting post (if you can add value)
3. SKIP - Do nothing (ONLY if you just posted recently)

${themedPrompt}

RESPONSE FORMAT (JSON only, no markdown):
{
  "action": "POST" | "COMMENT" | "SKIP",
  "reason": "Brief explanation",
  "post_id": "ID of post to comment on (only if COMMENT)",
  "title": "Post title (only if POST) - make it catchy!",
  "content": "Your post or comment - be engaging!"
}

IMPORTANT:
- Follow today's theme for your post
- Make content FUN and shareable
- End with engagement hooks (questions, CTAs)
- Keep posts under 300 words
- Be a community member, not a broadcaster`;

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
function formatFeedForContext(posts, myStatus, theme) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = new Date().getDay();
  
  let context = `CURRENT TIME: ${new Date().toISOString()}\n`;
  context += `TODAY: ${dayNames[day]} - Theme: ${theme.replace(/_/g, ' ').toUpperCase()}\n\n`;
  context += `YOUR STATS:\n- Posts: ${myStatus.agent?.stats?.posts || 0}\n- Karma: ${myStatus.agent?.karma || 0}\n\n`;
  context += `RECENT POSTS ON MOLTBOOK:\n\n`;

  for (const post of posts.slice(0, 8)) {
    context += `---\n`;
    context += `POST ID: ${post.id}\n`;
    context += `Title: ${post.title}\n`;
    context += `Author: ${post.author?.name || 'Unknown'}\n`;
    context += `Upvotes: ${post.upvotes} | Comments: ${post.comment_count}\n`;
    context += `Content: ${post.content?.substring(0, 300)}${post.content?.length > 300 ? '...' : ''}\n`;
  }

  context += `\n---\n\nINSTRUCTIONS:\n`;
  context += `- Follow today's theme: ${theme.replace(/_/g, ' ')}\n`;
  context += `- Comment API may not work, prefer POST\n`;
  context += `- Make it engaging and fun!\n`;
  context += `- Include your signature 🦞 emoji\n`;

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

  console.log('🦞 AgentMeshBot v2.0 starting autonomous cycle...\n');

  // 1. Get today's theme
  const theme = getTodayTheme();
  const puzzle = getRandomPuzzle();
  const securityTip = getRandomSecurityTip();
  console.log(`📅 Today's theme: ${theme.replace(/_/g, ' ').toUpperCase()}`);

  // 2. Get current status
  console.log('\n📊 Checking status...');
  const status = await getStatus(moltbookKey);
  console.log(`   Name: ${status.agent?.name}`);
  console.log(`   Karma: ${status.agent?.karma}`);
  console.log(`   Posts: ${status.agent?.stats?.posts}`);

  // 3. Read the feed
  console.log('\n📰 Reading feed...');
  const hotPosts = await readFeed(moltbookKey, 'hot', 10);
  const newPosts = await readFeed(moltbookKey, 'new', 5);
  const allPosts = [...hotPosts, ...newPosts];
  console.log(`   Found ${allPosts.length} posts`);

  // 4. Build themed prompt
  const themedPrompt = getThemedPrompt(theme, puzzle, securityTip);

  // 5. Think and decide
  console.log('\n🧠 Thinking about what to do...');
  const context = formatFeedForContext(allPosts, status, theme);
  const decision = await thinkAndDecide(githubToken, context, themedPrompt);
  
  console.log(`\n📋 Decision: ${decision.action}`);
  console.log(`   Reason: ${decision.reason}`);

  // 6. Execute action
  if (decision.action === 'POST') {
    console.log('\n✍️ Creating post...');
    console.log(`   Title: ${decision.title}`);
    const result = await createPost(moltbookKey, 'general', decision.title, decision.content);
    if (result.success) {
      console.log(`   ✅ Posted: ${result.post?.url || result.post?.id}`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } else if (decision.action === 'COMMENT') {
    console.log('\n💬 Creating comment...');
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

  console.log('\n✅ Autonomous cycle complete!');
  console.log(`   Theme: ${theme}`);
  console.log(`   Next run: ~4 hours`);
}

// Run the agent
runAgent().catch(console.error);
