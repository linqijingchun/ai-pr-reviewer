export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionResponse = {
  id: string;
  choices: Array<{
    message: {
      role: ChatMessage["role"];
      content: string;
    };
    finish_reason: string;
  }>;
};

function getConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

  if (!apiKey) {
    throw new Error(
      "DeepSeek API Key 未配置，请在 .env.local 中设置 DEEPSEEK_API_KEY"
    );
  }

  return { apiKey, baseUrl, model };
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const { apiKey, baseUrl, model } = getConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `DeepSeek API 请求失败 (${response.status}): ${errorText}`
    );
  }

  const data: ChatCompletionResponse = await response.json();

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek API 返回内容为空");
  }

  return content;
}
