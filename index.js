const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalBlock } = goals;
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const bot = mineflayer.createBot({
  host: process.env.MINECRAFT_HOST || '146.19.48.159',
  port: parseInt(process.env.MINECRAFT_PORT) || 25651,
  username: process.env.MINECRAFT_USERNAME || 'HellRay'
});

bot.loadPlugin(pathfinder);

bot.on('spawn', () => {
  bot.chat('Привет! Я ИИ-бот от Egoistong!');
  const defaultMovements = new Movements(bot);
  bot.pathfinder.setMovements(defaultMovements);
});

bot.on('chat', async (username, message) => {
  if (username === bot.username) return;

  if (message.startsWith('иди к')) {
    const [ , , x, y, z ] = message.split(' ');
    bot.chat(`Иду к ${x}, ${y}, ${z}`);
    bot.pathfinder.setGoal(new GoalBlock(parseInt(x), parseInt(y), parseInt(z)));
    return;
  }

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    });

    const reply = res.choices[0].message.content;
    bot.chat(reply.slice(0, 100));
  } catch (err) {
    console.error(err);
    bot.chat('Ошибка ИИ');
  }
});
