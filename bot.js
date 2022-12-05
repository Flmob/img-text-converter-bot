import "dotenv/config";
import { Telegraf } from "telegraf";
import { createWorker } from "tesseract.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  return ctx.sendMessage(
    "Just send me any image file, post with image or just image and if I will try my best to recognize text on this image."
  );
});

bot.on("message", async (ctx) => {
  const {
    update: {
      message: { document, photo },
    },
  } = ctx;

  let url;

  if (!document && !photo) {
    return ctx.sendMessage("Couldn't find any picture");
  }

  if (document) {
    if (document.mime_type.split("/")[0] !== "image") {
      return ctx.sendMessage("Wrong file format");
    }

    url = await ctx.telegram.getFileLink(document.file_id);
  }

  if (photo) {
    url = await ctx.telegram.getFileLink(photo[3].file_id);
  }

  if (url) {
    ctx.sendMessage("Processing...");

    try {
      const tesseractWorker = await createWorker();
      await tesseractWorker.loadLanguage("eng+rus+ukr");
      await tesseractWorker.initialize("eng+rus+ukr");
      const {
        data: { text },
      } = await tesseractWorker.recognize(url.href);
      await tesseractWorker.terminate();
      return ctx.sendMessage(text);
    } catch (error) {
      console.log(error);
      return ctx.sendMessage(
        "Sorry, something went wrong! Please, try again later"
      );
    }
  }
});

bot.launch();
