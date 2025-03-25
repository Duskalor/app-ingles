import 'dotenv/config';
import { schedule } from 'node-cron';
import { sendTelegram } from './send-telegram';
import { getPhrase, wait } from './utils';
import { phrases } from './phrases';

// */30 * * * *  cada 30 minutos
const app = () => {
  schedule('*/30 * * * * *', async () => {
    console.log('enviando frase');
    const phrase = getPhrase(phrases);
    const tense = phrase.tense.replace(/([A-Z])/g, ' $1').trim();
    const message = `📚 **${tense}**\n\n💬 ${phrase.phrase}\n\n`;
    await sendTelegram(message);
    await wait(10000);
    await sendTelegram(`🌍 Traducción :\n ${phrase.traduction}`);
  });
};

app();
