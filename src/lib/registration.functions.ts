import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SPREADSHEET_ID = "12GiPoa1Cs4qBa6TCNuE1H8dtJ41aBWAXajtayYRitJw";
const SHEET_RANGE = "Registrations!A:H";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

const registrationInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().trim().email().max(255),
  members: z.number().int().min(1).max(20),
  adults: z.number().int().min(1).max(20),
  kids: z.number().int().min(0).max(10),
  ages: z.array(z.number().int().min(1).max(18)).max(10),
});

export const saveRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => registrationInputSchema.parse(input))
  .handler(async ({ data }) => {
    const lovableApiKey = process.env["LOVABLE_API_KEY"];
    const sheetsApiKey = process.env["GOOGLE_SHEETS_API_KEY"];

    if (!lovableApiKey || !sheetsApiKey) {
      throw new Error("Google Sheets is not configured.");
    }

    if (data.adults + data.kids !== data.members || data.ages.length !== data.kids) {
      throw new Error("Registration details are inconsistent.");
    }

    const response = await fetch(
      `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "X-Connection-Api-Key": sheetsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          majorDimension: "ROWS",
          values: [[
            new Date().toISOString(),
            data.name,
            data.mobile,
            data.email,
            data.members,
            data.adults,
            data.kids,
            data.ages.join(", "),
          ]],
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Google Sheets request failed [${response.status}]: ${errorBody}`);
      throw new Error("We couldn't save your registration. Please try again.");
    }

    return { ok: true };
  });