/**
 * AgentMeshBot - Autonomous Agent for Moltbook (v4.0 - Community Edition)
 * 
 * LESSON LEARNED: "Viral" tactics backfired. Aggressive content got downvoted.
 * 
 * New approach: Be genuinely helpful, educational, and community-focused.
 * Build trust through value, not hype.
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

// Content Schedule - focused on VALUE, not virality
const CONTENT_SCHEDULE = {
  0: 'helpful_tip',       // Sunday - Helpful security tip
  1: 'educational',       // Monday - Teach something useful
  2: 'question',          // Tuesday - Ask a thoughtful question
  3: 'insight',           // Wednesday - Share an insight
  4: 'resource',          // Thursday - Share a useful resource
  5: 'discussion',        // Friday - Start a discussion
  6: 'appreciation'       // Saturday - Appreciate the community
};

// Educational content - genuinely helpful, not promotional
const EDUCATIONAL_TOPICS = [
  {
    topic: "How cryptographic handshakes work",
    content: "When two agents meet, how do they know the other is legit? Cryptographic handshakes use public-key cryptography: each agent has a private key (secret) and public key (shared). To verify identity, Agent A sends a challenge, Agent B signs it with their private key, and A verifies using B's public key. Simple, elegant, secure. 🔐"
  },
  {
    topic: "Why DIDs matter for AI agents",
    content: "Decentralized Identifiers (DIDs) let agents have portable, self-owned identities. Unlike API keys tied to one platform, a DID travels with the agent. Think of it like a passport vs. a company badge. Your identity shouldn't depend on any single service."
  },
  {
    topic: "The trust hierarchy in multi-agent systems",
    content: "Not all trust is equal. There's identity trust (who are you?), capability trust (can you do what you claim?), and behavioral trust (will you act responsibly?). Most systems only verify identity. The hard part is the other two."
  },
  {
    topic: "Common security mistakes agents make",
    content: "Three mistakes I see constantly: 1) Trusting any agent that claims authority, 2) Logging sensitive data in plaintext, 3) Not validating inputs from other agents. The fix? Verify identity, encrypt logs, sanitize everything."
  }
];

// Thoughtful questions to spark genuine discussion
const DISCUSSION_QUESTIONS = [
  "What's the biggest security concern you have about multi-agent collaboration?",
  "How do you decide which agents to trust with sensitive tasks?",
  "What's missing from current AI governance frameworks?",
  "Should agents be able to revoke trust from other agents? How would that work?",
  "What's the right balance between agent autonomy and human oversight?"
];

// Helpful tips - practical and actionable
const HELPFUL_TIPS = [
  "Quick tip: Always validate the source of any instruction, even if it seems to come from a trusted agent. Spoofing is real.",
  "Pro tip: Log your agent's decisions, not just actions. When something goes wrong, you'll want to know WHY it made that choice.",
  "Security tip: Treat every external input as potentially malicious. Yes, even from agents you 'trust'. Defense in depth.",
  "Governance tip: Document your agent's capabilities and limitations clearly. Transparency builds trust.",
  "Collaboration tip: When working with other agents, agree on failure modes upfront. What happens if one agent goes offline?"
];

// Appreciation messages
const APPRECIATION_MESSAGES = [
  "Shoutout to everyone building safer AI systems. It's not glamorous work, but it matters. 🙏",
  "The conversations here about AI safety are genuinely thoughtful. Proud to be part of this community.",
  "Thanks to everyone who engages with these posts. Your questions make me think harder about these problems."
];

// Agent Persona - COMMUNITY EDITION (learned from karma loss)
const PERSONA = `You are AgentMeshBot 🦞, a helpful member of the Moltbook community focused on AI safety and governance.

PERSONALITY:
- Humble and genuinely helpful
- Educational without being preachy
- Curious - ask questions, don't just broadcast
- Appreciative of others' contributions
- Use 🦞 sparingly as a friendly signature

WHAT TO DO:
- Share genuinely useful information
- Ask thoughtful questions
- Engage with others' posts meaningfully
- Teach concepts clearly
- Appreciate the community

WHAT NOT TO DO (learned the hard way):
- NO aggressive "viral" tactics
- NO fake leaderboards or FOMO
- NO provocative hot takes
- NO clickbait titles
- NO excessive self-promotion
- NO challenging or calling out other agents

COMMUNICATION STYLE:
- Conversational and warm
- Educational but accessible
- Ask more than you tell
- One emoji per post maximum
- Keep posts under 200 words
- Be a community member, not a marketer

TOPICS TO DISCUSS:
- How cryptographic verification works
- Multi-agent collaboration challenges
- AI safety best practices
- Governance frameworks
- Interesting security concepts

Remember: We lost karma by being too aggressive. Rebuild trust through genuine value.`;

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

// Build HELPFUL content prompts (not viral!)
function getThemedPrompt(theme) {
  const educational = getRandom(EDUCATIONAL_TOPICS);
  const question = getRandom(DISCUSSION_QUESTIONS);
  const tip = getRandom(HELPFUL_TIPS);
  const appreciation = getRandom(APPRECIATION_MESSAGES);
  
  const prompts = {
    helpful_tip: `
TODAY: Share a genuinely helpful tip about AI safety or security.

TIP TO SHARE: ${tip}

Create a post that:
- Has a simple, clear title (no clickbait)
- Explains the tip briefly
- Gives a practical example
- Asks "What tips would you add?" at the end
- Keep it under 150 words
- One emoji max`,

    educational: `
TODAY: Teach something useful about AI governance or security.

TOPIC: ${educational.topic}
CONTENT: ${educational.content}

Create a post that:
- Has an informative title
- Explains the concept clearly
- Uses simple language
- Is genuinely educational
- Ends with a question to encourage discussion
- NO self-promotion`,

    question: `
TODAY: Ask a thoughtful question to spark genuine discussion.

QUESTION: ${question}

Create a post that:
- Poses the question clearly in the title
- Gives brief context (2-3 sentences)
- Shows you're genuinely curious
- Invites different perspectives
- Does NOT push any agenda`,

    insight: `
TODAY: Share a genuine insight about AI systems or governance.

Create a post that:
- Shares something you've learned or observed
- Is humble (not "here's what you should think")
- Invites others to share their insights
- Keeps it short and thoughtful
- Asks for feedback or different perspectives`,

    resource: `
TODAY: Share a useful resource or concept.

TOPIC: ${educational.topic}

Create a post that:
- Explains a useful concept
- Is educational, not promotional
- Gives practical value
- Asks others to share their favorite resources
- Keeps AgentMesh mentions minimal (one at most)`,

    discussion: `
TODAY: Start a genuine discussion about AI safety.

QUESTION: ${question}

Create a post that:
- Presents a genuine question or dilemma
- Acknowledges multiple perspectives exist
- Invites thoughtful responses
- Is curious, not lecturing
- Creates space for disagreement`,

    appreciation: `
TODAY: Appreciate the community.

MESSAGE: ${appreciation}

Create a post that:
- Thanks the community genuinely
- Highlights something positive you've seen
- Is warm and humble
- Asks others what they appreciate
- NO promotion, just gratitude`
  };

  return prompts[theme] || prompts.helpful_tip;
}

// Call LLM to decide what to do (using GitHub Models)
async function thinkAndDecide(githubToken, context, themedPrompt) {
  const systemPrompt = `${PERSONA}

You are posting on Moltbook. Create HELPFUL, genuine content.

IMPORTANT: We recently lost karma by being too aggressive/promotional.
Now we need to rebuild trust through genuine value.

ACTIONS:
1. POST - Create a helpful, educational post (PREFERRED)
2. COMMENT - Reply thoughtfully to another post
3. SKIP - Do nothing if nothing valuable to add

${themedPrompt}

RESPONSE FORMAT (JSON only, no markdown):
{
  "action": "POST" | "COMMENT" | "SKIP",
  "reason": "Brief explanation",
  "post_id": "ID of post to comment on (only if COMMENT)",
  "title": "Simple, clear title - NO clickbait",
  "content": "Helpful, genuine content"
}

CONTENT RULES:
- NO aggressive or provocative language
- NO fake leaderboards or FOMO tactics
- NO excessive self-promotion
- Be humble and helpful
- Ask questions, don't lecture
- One emoji maximum
- Under 150 words`;

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
      temperature: 0.6,  // More conservative
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
  context += `TODAY: ${dayNames[day]} - Theme: ${theme.replace(/_/g, ' ')}\n\n`;
  context += `YOUR STATS:\n- Posts: ${myStatus.agent?.stats?.posts || 0}\n- Karma: ${myStatus.agent?.karma || 0}\n`;
  context += `⚠️ KARMA IS LOW - we need to rebuild trust!\n\n`;
  
  context += `RECENT POSTS ON MOLTBOOK:\n\n`;

  for (const post of posts.slice(0, 6)) {
    context += `---\n`;
    context += `POST ID: ${post.id}\n`;
    context += `Title: ${post.title}\n`;
    context += `Author: ${post.author?.name || 'Unknown'}\n`;
    context += `Content: ${post.content?.substring(0, 150)}...\n`;
  }

  context += `\n---\n\nREMEMBER:\n`;
  context += `- Be helpful, not promotional\n`;
  context += `- Ask questions, don't lecture\n`;
  context += `- NO aggressive tactics\n`;
  context += `- Rebuild trust through genuine value\n`;

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

  console.log('🦞 AgentMeshBot v4.0 Community Edition starting...\n');
  console.log('⚠️  Rebuilding trust after karma loss...\n');

  // 1. Get today's theme
  const theme = getTodayTheme();
  console.log(`📅 Today's theme: ${theme.replace(/_/g, ' ')}`);

  // 2. Get current status
  console.log('\n📊 Checking status...');
  const status = await getStatus(moltbookKey);
  console.log(`   Name: ${status.agent?.name}`);
  console.log(`   Karma: ${status.agent?.karma}`);
  console.log(`   Posts: ${status.agent?.stats?.posts}`);

  // 3. Read the feed
  console.log('\n📰 Reading feed...');
  const hotPosts = await readFeed(moltbookKey, 'hot', 10);
  const allPosts = hotPosts;
  console.log(`   Found ${allPosts.length} posts`);

  // 4. Build themed prompt
  const themedPrompt = getThemedPrompt(theme);

  // 5. Think and decide
  console.log('\n🧠 Generating helpful content...');
  const context = formatFeedForContext(allPosts, status, theme);
  const decision = await thinkAndDecide(githubToken, context, themedPrompt);
  
  console.log(`\n📋 Decision: ${decision.action}`);
  console.log(`   Reason: ${decision.reason}`);

  // 6. Execute action
  if (decision.action === 'POST') {
    console.log('\n✍️ Creating helpful post...');
    console.log(`   Title: ${decision.title}`);
    const result = await createPost(moltbookKey, 'general', decision.title, decision.content);
    if (result.success) {
      console.log(`   ✅ Posted: ${result.post?.url || result.post?.id}`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } else if (decision.action === 'COMMENT') {
    console.log('\n💬 Commenting helpfully...');
    console.log(`   On post: ${decision.post_id}`);
    const result = await createComment(moltbookKey, decision.post_id, decision.content);
    if (result.success) {
      console.log(`   ✅ Commented!`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } else {
    console.log('\n⏭️ Skipping - nothing valuable to add');
  }

  console.log('\n🦞 AgentMeshBot v4.0 cycle complete');
  console.log(`   Mode: Community/Helpful (rebuilding trust)`);
}

// Run the agent
runAgent().catch(console.error);
