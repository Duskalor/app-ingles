const TOKEN_BOT = process.env.TOKEN_BOT;
export const sendTelegram = async (text: string) => {
  await fetch(
    `https://api.telegram.org/bot${TOKEN_BOT}/sendMessage?chat_id=1974797847&text=${encodeURIComponent(
      text
    )}`
  );
};
