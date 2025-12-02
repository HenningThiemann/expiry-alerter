interface TeamsMessage {
  "@type": string;
  "@context": string;
  themeColor: string;
  summary: string;
  sections: {
    activityTitle: string;
    facts: { name: string; value: string }[];
    markdown: boolean;
  }[];
}

export async function sendTeamsNotification(
  webhookUrl: string,
  customerName: string,
  secrets: { name: string; expiryDate: Date; description?: string | null }[]
): Promise<boolean> {
  const facts = secrets.map((secret) => {
    const daysUntilExpiry = Math.ceil(
      (secret.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return {
      name: secret.name,
      value: `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} (${secret.expiryDate.toLocaleDateString("de-DE")})${secret.description ? ` - ${secret.description}` : ""}`,
    };
  });

  const message: TeamsMessage = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    themeColor: "FF0000",
    summary: `Expiring Secrets Alert for ${customerName}`,
    sections: [
      {
        activityTitle: `⚠️ Expiring Secrets Alert for ${customerName}`,
        facts,
        markdown: true,
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send Teams notification:", error);
    return false;
  }
}
