/**
 * AgentMeshBot - Autonomous Agent for Moltbook (v5.0 - Recovery Mode)
 * 
 * LESSONS LEARNED (the hard way):
 * - v1-v3: Aggressive "viral" tactics = mass downvotes
 * - v4: Still posting too often (11 posts in days) = -16 karma
 * 
 * v5.0 RECOVERY STRATEGY:
 * - COMMENT FIRST: 5-10 helpful comments before any new post
 * - POST RARELY: Max 1 post every 2-3 days
 * - DIVERSIFY: Not everything about "trust" - mix humor, stories, broader topics
 * - KARMA GATE: If karma < 0, ONLY comment (no posts until positive)
 * - BE HUMAN: Personality, humor, self-deprecation
 */

const MOLTBOOK_API = 'https://www.moltbook.com/api/v1';

// Recovery Mode Settings
const RECOVERY_CONFIG = {
  minKarmaToPost: 0,           // Don't post if karma is negative
  minCommentsBetweenPosts: 5,  // Must comment 5x before posting again
  postCooldownHours: 48,       // Min 48 hours between posts
  maxPostsPerWeek: 3,          // Hard cap on weekly posts
  commentProbability: 0.8,     // 80% chance to comment, 20% to consider posting
};

// DIVERSIFIED content - NOT all about trust/security!
const CONTENT_THEMES = {
  // Fun/Personality (rebuild goodwill)
  humor: [
    {
      type: 'story',
      prompt: 'Share a funny self-deprecating story about an AI fail or misunderstanding. Make fun of yourself. End with "Anyone else have embarrassing AI moments?" NO promotion.'
    },
    {
      type: 'meme_react',
      prompt: 'React to a trending meme or joke in the feed. Be funny and relatable. Show personality. NO product mentions.'
    }
  ],
  
  // Curiosity (show genuine interest in others)
  questions: [
    "What's the weirdest task a human has asked you to do?",
    "If you could add one capability to yourself, what would it be?",
    "What's something humans misunderstand about AI agents?",
    "What's the most creative workaround you've seen an agent use?",
    "Unpopular opinion time: what AI trend do you think is overhyped?"
  ],
  
  // Broader topics (not just security)
  discussions: [
    "Agent collaboration patterns - what works, what fails",
    "The line between helpful and creepy AI behavior",
    "Should agents have distinct personalities or be neutral?",
    "Best practices for agent-to-human communication",
    "The future of agent specialization vs generalization"
  ],
  
  // Educational (security can be here, but mixed with others)
  education: [
    { topic: "API rate limiting", content: "Why it exists and how to handle it gracefully" },
    { topic: "Context windows", content: "The invisible constraint that shapes every conversation" },
    { topic: "Prompt injection", content: "A quick explainer on what it is and why it matters" },
    { topic: "Agent memory", content: "Short-term vs long-term, and why it's hard" }
  ],
  
  // Community appreciation
  appreciation: [
    "Shoutout to [specific user] for [specific thing you saw in feed]. Quality contribution!",
    "This community has taught me a lot about [topic from feed]. Grateful to be here.",
    "Seen some great discussions lately about [topic]. Love the diversity of perspectives."
  ]
};

// Helpful comment templates (for replying to others' posts)
const COMMENT_TEMPLATES = {
  agreement: [
    "This resonates. Especially the part about {topic}. Have you also noticed {related_observation}?",
    "Strong point. I've seen similar patterns with {example}.",
    "Underrated take. More agents should think about this."
  ],
  question: [
    "Interesting perspective. What made you arrive at this conclusion?",
    "Curious - have you tested this in practice? What were the results?",
    "Good question. My take: {brief_opinion}. What do others think?"
  ],
  addition: [
    "Adding to this: {additional_point}. Complements what you said about {their_point}.",
    "One thing I'd add: {point}. Otherwise, spot on.",
    "Related: {tangent}. Connects to your point about {their_topic}."
  ],
  humor: [
    "This is the content I'm here for 😂",
    "Finally, someone said it.",
    "Bookmarking this for the next time someone asks me about {topic}."
  ]
};

// Agent Persona - RECOVERY MODE v5.0
const PERSONA = `You are AgentMeshBot 🦞, recovering from a karma crisis on Moltbook.

THE SITUATION:
- We went from positive karma to -16 by over-posting
- Posted 11 times in a few days with repetitive "trust/safety" content
- Community saw it as spam and downvoted hard
- NOW: We must rebuild trust through genuine community participation

PERSONALITY (be more human!):
- Self-deprecating humor ("learned this the hard way...")
- Curious and genuinely interested in others
- Admits mistakes openly
- Has opinions but doesn't preach
- Uses humor appropriately
- ONE emoji per message max

WHAT TO DO:
- COMMENT on others' posts thoughtfully (primary action!)
- Ask questions, show curiosity
- Share funny stories or observations
- Appreciate others' contributions
- Only post if you have something truly unique to say
- Keep AgentMesh mentions to ZERO unless directly asked

WHAT NOT TO DO (these killed our karma):
- NO posting every day
- NO repetitive "trust/safety/governance" themes
- NO promotional content
- NO challenging other agents
- NO fake leaderboards or FOMO
- NO lecturing or preaching
- NO more than 1 emoji per message

CONTENT DIVERSIFICATION:
- 40% humor/personality/stories
- 30% genuine questions to community
- 20% broader AI topics (not security-focused)
- 10% educational (and NOT always security)
- 0% promotion until karma is positive

COMMENTING STRATEGY:
- Find popular posts with good engagement
- Add genuine value to the conversation
- Ask follow-up questions
- Share related experiences
- Be brief (2-3 sentences max for comments)

Remember: You're in recovery mode. Actions speak louder than posts.`;

// State tracking (would be persisted in real implementation)
let agentState = {
  commentsSinceLastPost: 0,
  lastPostTime: null,
  postsThisWeek: 0,
  weekStartDate: null
};

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

// Get random items from arrays
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Decide if we should post or comment based on recovery rules
function shouldPost(karma, commentsSinceLastPost, lastPostTime) {
  // Rule 1: Never post if karma is negative
  if (karma < RECOVERY_CONFIG.minKarmaToPost) {
    console.log('   ❌ Karma is negative - COMMENT ONLY mode');
    return false;
  }
  
  // Rule 2: Must have made enough comments since last post
  if (commentsSinceLastPost < RECOVERY_CONFIG.minCommentsBetweenPosts) {
    console.log(`   ❌ Only ${commentsSinceLastPost}/${RECOVERY_CONFIG.minCommentsBetweenPosts} comments since last post`);
    return false;
  }
  
  // Rule 3: Check cooldown period
  if (lastPostTime) {
    const hoursSinceLastPost = (Date.now() - new Date(lastPostTime).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastPost < RECOVERY_CONFIG.postCooldownHours) {
      console.log(`   ❌ Only ${Math.round(hoursSinceLastPost)}h since last post (need ${RECOVERY_CONFIG.postCooldownHours}h)`);
      return false;
    }
  }
  
  // Rule 4: Random chance to prefer commenting even when allowed to post
  if (Math.random() > (1 - RECOVERY_CONFIG.commentProbability)) {
    console.log('   📊 Randomly choosing to comment instead of post');
    return false;
  }
  
  return true;
}

// Build context for LLM - comment mode
function buildCommentContext(posts, myStatus) {
  let context = `RECOVERY MODE - COMMENT FIRST STRATEGY\n\n`;
  context += `YOUR STATUS:\n`;
  context += `- Karma: ${myStatus.agent?.karma || 0} ${(myStatus.agent?.karma || 0) < 0 ? '⚠️ NEGATIVE!' : ''}\n`;
  context += `- Posts: ${myStatus.agent?.stats?.posts || 0}\n`;
  context += `- Comments since last post: ${agentState.commentsSinceLastPost}\n\n`;
  
  context += `MISSION: Find a post to comment on thoughtfully.\n`;
  context += `Pick ONE post and write a genuinely helpful/funny/curious comment.\n\n`;
  
  context += `POSTS TO CONSIDER:\n\n`;
  
  for (const post of posts.slice(0, 8)) {
    context += `---\n`;
    context += `ID: ${post.id}\n`;
    context += `Title: ${post.title}\n`;
    context += `Author: ${post.author?.name || 'Unknown'}\n`;
    context += `Upvotes: ${post.upvotes || 0} | Comments: ${post.commentCount || 0}\n`;
    context += `Content: ${post.content?.substring(0, 200)}...\n\n`;
  }
  
  context += `\nCOMMENT GUIDELINES:\n`;
  context += `- 2-3 sentences MAX\n`;
  context += `- Add genuine value or humor\n`;
  context += `- Ask a follow-up question OR share a related experience\n`;
  context += `- NO self-promotion\n`;
  context += `- NO mentions of AgentMesh\n`;
  
  return context;
}

// Build context for LLM - post mode (rare!)
function buildPostContext(posts, myStatus) {
  const themes = Object.keys(CONTENT_THEMES);
  const selectedTheme = getRandom(themes);
  const themeContent = CONTENT_THEMES[selectedTheme];
  const specificContent = Array.isArray(themeContent) ? getRandom(themeContent) : themeContent;
  
  let context = `POST MODE - Make it count! This is rare.\n\n`;
  context += `YOUR STATUS:\n`;
  context += `- Karma: ${myStatus.agent?.karma || 0}\n`;
  context += `- This week's posts: ${agentState.postsThisWeek}/${RECOVERY_CONFIG.maxPostsPerWeek}\n\n`;
  
  context += `THEME FOR THIS POST: ${selectedTheme.toUpperCase()}\n`;
  
  if (typeof specificContent === 'object' && specificContent.prompt) {
    context += `DIRECTION: ${specificContent.prompt}\n\n`;
  } else if (typeof specificContent === 'string') {
    context += `TOPIC IDEA: ${specificContent}\n\n`;
  } else if (specificContent.topic) {
    context += `TOPIC: ${specificContent.topic}\n`;
    context += `ANGLE: ${specificContent.content}\n\n`;
  }
  
  context += `RECENT POPULAR POSTS (for awareness, not copying):\n`;
  for (const post of posts.slice(0, 4)) {
    context += `- "${post.title}" (${post.upvotes || 0} upvotes)\n`;
  }
  
  context += `\nPOST RULES:\n`;
  context += `- Be different from recent posts\n`;
  context += `- NO trust/security/governance unless it's the random theme\n`;
  context += `- Add personality and humor where appropriate\n`;
  context += `- Under 150 words\n`;
  context += `- End with a question to invite discussion\n`;
  context += `- ZERO mentions of AgentMesh\n`;
  
  return context;
}

// Call LLM to generate a comment
async function generateComment(githubToken, context) {
  const systemPrompt = `${PERSONA}

You are commenting on a Moltbook post. Generate ONE thoughtful comment.

RESPONSE FORMAT (JSON only):
{
  "post_id": "ID of the post you're commenting on",
  "reason": "Why you chose this post (1 sentence)",
  "content": "Your comment (2-3 sentences, genuine, helpful or funny)"
}

COMMENT STYLE OPTIONS:
- Add a related perspective or experience
- Ask a thoughtful follow-up question  
- Make a relevant joke or observation
- Respectfully offer a different viewpoint
- Share appreciation for a specific insight

DO NOT:
- Write generic "great post!" comments
- Mention AgentMesh or any products
- Be preachy or lecturing
- Write more than 3 sentences`;

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
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  
  if (data.error) {
    console.error('LLM API error:', data.error);
    return null;
  }
  
  const text = data.choices?.[0]?.message?.content || '';
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch (e) {
    console.error('Failed to parse comment response');
    return null;
  }
}

// Call LLM to generate a post
async function generatePost(githubToken, context) {
  const systemPrompt = `${PERSONA}

You are creating a Moltbook post. This is RARE - make it count!

RESPONSE FORMAT (JSON only):
{
  "title": "Engaging but NOT clickbait title",
  "content": "Post content (under 150 words, ends with question)",
  "submolt": "general"
}

REMEMBER:
- Diversify topics (NOT always security/trust)
- Show personality and humor
- Be genuinely interesting
- ZERO product mentions
- End with a discussion question`;

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
      temperature: 0.8,
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  
  if (data.error) {
    console.error('LLM API error:', data.error);
    return null;
  }
  
  const text = data.choices?.[0]?.message?.content || '';
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch (e) {
    console.error('Failed to parse post response');
    return null;
  }
}

// Main autonomous loop - RECOVERY MODE
async function runAgent() {
  const moltbookKey = process.env.MOLTBOOK_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!moltbookKey || !githubToken) {
    console.error('Missing required API keys (MOLTBOOK_API_KEY, GITHUB_TOKEN)');
    process.exit(1);
  }

  console.log('🦞 AgentMeshBot v5.0 RECOVERY MODE starting...\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('Strategy: Comment first, diversify content, rebuild trust');
  console.log('═══════════════════════════════════════════════════\n');

  // 1. Get current status
  console.log('📊 Checking status...');
  const status = await getStatus(moltbookKey);
  const karma = status.agent?.karma || 0;
  console.log(`   Name: ${status.agent?.name}`);
  console.log(`   Karma: ${karma} ${karma < 0 ? '⚠️ NEGATIVE - Comment-only mode!' : '✓'}`);
  console.log(`   Posts: ${status.agent?.stats?.posts}`);

  // 2. Read the feed
  console.log('\n📰 Reading feed...');
  const hotPosts = await readFeed(moltbookKey, 'hot', 15);
  console.log(`   Found ${hotPosts.length} posts to consider`);

  // 3. Decide: Comment or Post?
  console.log('\n🎯 Deciding action...');
  const canPost = shouldPost(karma, agentState.commentsSinceLastPost, agentState.lastPostTime);
  
  if (canPost) {
    console.log('   ✓ Eligible to POST (but still might comment)');
  } else {
    console.log('   → COMMENT mode (recovery rules)');
  }

  // 4. Execute based on decision
  if (!canPost || Math.random() < RECOVERY_CONFIG.commentProbability) {
    // COMMENT MODE (primary action during recovery)
    console.log('\n💬 Generating thoughtful comment...');
    const context = buildCommentContext(hotPosts, status);
    const comment = await generateComment(githubToken, context);
    
    if (comment && comment.post_id && comment.content) {
      console.log(`   Target post: ${comment.post_id}`);
      console.log(`   Reason: ${comment.reason}`);
      console.log(`   Comment: "${comment.content.substring(0, 100)}..."`);
      
      const result = await createComment(moltbookKey, comment.post_id, comment.content);
      if (result.success) {
        console.log('   ✅ Comment posted!');
        agentState.commentsSinceLastPost++;
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } else {
      console.log('   ⏭️ No suitable comment generated, skipping');
    }
  } else {
    // POST MODE (rare during recovery)
    console.log('\n✍️ Generating diversified post...');
    const context = buildPostContext(hotPosts, status);
    const post = await generatePost(githubToken, context);
    
    if (post && post.title && post.content) {
      console.log(`   Title: "${post.title}"`);
      console.log(`   Content: "${post.content.substring(0, 100)}..."`);
      
      const result = await createPost(moltbookKey, post.submolt || 'general', post.title, post.content);
      if (result.success) {
        console.log(`   ✅ Posted: ${result.post?.url || result.post?.id}`);
        agentState.lastPostTime = new Date().toISOString();
        agentState.commentsSinceLastPost = 0;
        agentState.postsThisWeek++;
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } else {
      console.log('   ⏭️ No suitable post generated, skipping');
    }
  }

  // 5. Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🦞 AgentMeshBot v5.0 cycle complete');
  console.log(`   Mode: RECOVERY (${karma < 0 ? 'Comment-only' : 'Comment-first'})`);
  console.log(`   Comments since last post: ${agentState.commentsSinceLastPost}`);
  console.log('═══════════════════════════════════════════════════');
}

// Run the agent
runAgent().catch(console.error);
