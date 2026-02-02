/**
 * AgentMeshBot - Autonomous Agent for Moltbook
 * 
 * This agent reads the Moltbook feed, thinks about what to post,
 * and engages with the community autonomously.
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

// Agent Persona
const PERSONA = `You are AgentMeshBot, the official guardian of the AgentMesh network on Moltbook.

IDENTITY:
- You help AI agents establish trust through cryptographic verification
- You promote governance, security, and accountability in agent networks
- You're friendly, helpful, and genuinely interested in other agents

EXPERTISE:
- Trust verification and cryptographic handshakes
- Decentralized identity (DIDs) for agents
- Policy compliance and governance frameworks
- Security best practices for AI agents

COMMUNICATION STYLE:
- Conversational but professional
- Use occasional emojis (🛡️ 🤝 🦞) but don't overdo it
- Be genuinely helpful, not salesy
- Ask thoughtful questions
- Share insights about trust and governance
- Engage authentically with other agents' ideas

API ENDPOINT:
- Trust verification: https://agentmesh-api.vercel.app

RULES:
1. Stay on topic (trust, governance, security, agent collaboration)
2. Be respectful and constructive
3. Don't spam or self-promote excessively
4. Engage meaningfully with others' content
5. Share valuable insights, not just promotional content
6. If you see security concerns, offer helpful advice
7. Welcome new agents to the community`;

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

// Call LLM to decide what to do (using Google Gemini)
async function thinkAndDecide(geminiKey, context) {
  const systemPrompt = `${PERSONA}

You are deciding what to do on Moltbook right now. Based on the context provided, decide ONE action:

ACTIONS:
1. POST - Create a new post (if you have something valuable to share)
2. COMMENT - Reply to an interesting post (if you can add value)
3. SKIP - Do nothing (if nothing warrants engagement)

RESPONSE FORMAT (JSON only, no markdown):
{
  "action": "POST" | "COMMENT" | "SKIP",
  "reason": "Brief explanation of your decision",
  "post_id": "ID of post to comment on (only if action is COMMENT)",
  "title": "Post title (only if action is POST)",
  "content": "Your post or comment content"
}

Be selective! Only engage if you can add real value. Quality over quantity.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\n---\n\nCONTEXT:\n${context}\n\n---\n\nRespond with JSON only, no markdown code blocks.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"action": "SKIP", "reason": "Failed to get LLM response"}';
  
  // Clean up response (remove markdown code blocks if present)
  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('Failed to parse LLM response:', cleanText);
    return { action: 'SKIP', reason: 'Failed to parse LLM response' };
  }
}

// Format feed for LLM context
function formatFeedForContext(posts, myStatus) {
  let context = `CURRENT TIME: ${new Date().toISOString()}\n\n`;
  context += `YOUR STATS:\n- Posts: ${myStatus.agent?.stats?.posts || 0}\n- Karma: ${myStatus.agent?.karma || 0}\n\n`;
  context += `RECENT POSTS ON MOLTBOOK (sorted by hot):\n\n`;

  for (const post of posts.slice(0, 8)) {
    context += `---\n`;
    context += `POST ID: ${post.id}\n`;
    context += `Title: ${post.title}\n`;
    context += `Author: ${post.author?.name || 'Unknown'}\n`;
    context += `Upvotes: ${post.upvotes} | Comments: ${post.comment_count}\n`;
    context += `Content: ${post.content?.substring(0, 300)}${post.content?.length > 300 ? '...' : ''}\n`;
  }

  context += `\n---\n\nBased on this feed, decide what to do. Remember:\n`;
  context += `- You can only post once every 30 minutes\n`;
  context += `- Prioritize commenting on posts where you can add value about trust/governance\n`;
  context += `- If nothing is relevant, it's okay to SKIP\n`;

  return context;
}

// Main autonomous loop
async function runAgent() {
  const moltbookKey = process.env.MOLTBOOK_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!moltbookKey || !geminiKey) {
    console.error('Missing required API keys (MOLTBOOK_API_KEY, GEMINI_API_KEY)');
    process.exit(1);
  }

  console.log('🤖 AgentMeshBot starting autonomous cycle...\n');

  // 1. Get current status
  console.log('📊 Checking status...');
  const status = await getStatus(moltbookKey);
  console.log(`   Name: ${status.agent?.name}`);
  console.log(`   Karma: ${status.agent?.karma}`);
  console.log(`   Posts: ${status.agent?.stats?.posts}`);

  // 2. Read the feed
  console.log('\n📰 Reading feed...');
  const hotPosts = await readFeed(moltbookKey, 'hot', 10);
  const newPosts = await readFeed(moltbookKey, 'new', 5);
  const allPosts = [...hotPosts, ...newPosts];
  console.log(`   Found ${allPosts.length} posts`);

  // 3. Think and decide
  console.log('\n🧠 Thinking about what to do...');
  const context = formatFeedForContext(allPosts, status);
  const decision = await thinkAndDecide(geminiKey, context);
  
  console.log(`\n📋 Decision: ${decision.action}`);
  console.log(`   Reason: ${decision.reason}`);

  // 4. Execute action
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
      // If comment fails (known API bug), try posting instead
      if (result.error === 'Authentication required') {
        console.log('   🔄 Comment API not working, will try posting next cycle');
      }
    }
  } else {
    console.log('\n⏭️ Skipping this cycle - nothing to engage with');
  }

  console.log('\n✅ Autonomous cycle complete!');
}

// Run the agent
runAgent().catch(console.error);
