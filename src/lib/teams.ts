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
  potentialAction?: {
    "@type": string;
    name: string;
    targets: { os: string; uri: string }[];
  }[];
}

export async function sendTeamsNotification(
  webhookUrl: string,
  customerName: string,
  secrets: {
    id: string;
    name: string;
    expiryDate: Date;
    description?: string | null;
  }[]
): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const facts = secrets.map((secret) => {
    const daysUntilExpiry = Math.ceil(
      (secret.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const secretUrl = `${baseUrl}/secrets/${secret.id}`;
    return {
      name: secret.name,
      value: `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} (${secret.expiryDate.toLocaleDateString("en-GB")})${secret.description ? ` - ${secret.description}` : ""}\n[View Secret](${secretUrl})`,
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
    potentialAction: secrets.map((secret) => ({
      "@type": "OpenUri",
      name: `View ${secret.name}`,
      targets: [
        {
          os: "default",
          uri: `${baseUrl}/secrets/${secret.id}`,
        },
      ],
    })),
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
