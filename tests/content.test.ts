import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defaultContent, defaultContentKo, type SiteContent } from "@/content/default";
import { getContent, mergeContent, normalizeSections, saveContent } from "@/lib/content";
import {
  fixGermanUmlauts,
  migrateGermanUmlauts,
  migrateKoreanContent,
  translateKoreanContent,
} from "@/lib/content-migration";
import { getDb } from "@/lib/db";

describe("mergeContent", () => {
  it("behaelt Defaults bei leerem Override", () => {
    const merged = mergeContent(defaultContent, {});
    expect(merged).toEqual(defaultContent);
  });

  it("ueberschreibt einfache Felder", () => {
    const merged = mergeContent(defaultContent, { coupleNames: "Lisa & Tom" });
    expect(merged.coupleNames).toBe("Lisa & Tom");
    expect(merged.schedule).toEqual(defaultContent.schedule);
  });

  it("ersetzt Arrays, wenn sie gueltig sind", () => {
    const schedule = [{ time: "15:00", title: "Trauung", description: "Kirche" }];
    const merged = mergeContent(defaultContent, { schedule });
    expect(merged.schedule).toEqual(schedule);
  });

  it("ignoriert ungueltige Arrays (kein Array)", () => {
    const merged = mergeContent(defaultContent, {
      schedule: "kaputt" as unknown as never,
      faq: 42 as unknown as never,
    });
    expect(merged.schedule).toEqual(defaultContent.schedule);
    expect(merged.faq).toEqual(defaultContent.faq);
  });
});

describe("normalizeSections", () => {
  it("migriert das alte Shape { id, enabled }", () => {
    const sections = normalizeSections([
      { id: "gallery", enabled: true },
      { id: "map", enabled: false },
    ]);
    expect(sections.find((s) => s.type === "gallery")?.enabled).toBe(true);
    expect(sections.find((s) => s.type === "map")?.enabled).toBe(false);
    // Fehlende Singleton-Sektionen werden ergaenzt.
    expect(sections.find((s) => s.type === "hero")).toBeDefined();
    expect(sections.find((s) => s.type === "rsvp")).toBeDefined();
  });

  it("erhaelt die Reihenfolge und erlaubt mehrere Bild-Sektionen", () => {
    const sections = normalizeSections([
      { key: "map", type: "map", enabled: true },
      { key: "img-1", type: "image", enabled: true, imageId: 1 },
      { key: "img-2", type: "image", enabled: true, imageId: 2 },
      { key: "gallery", type: "gallery", enabled: true },
    ]);
    // Relative Reihenfolge der uebergebenen Sektionen bleibt erhalten,
    // fehlende Singleton-Sektionen werden hinten ergaenzt.
    expect(sections.slice(0, 4).map((s) => s.type)).toEqual(["map", "image", "image", "gallery"]);
    expect(sections.filter((s) => s.type === "image")).toHaveLength(2);
  });

  it("vergibt eindeutige Keys fuer Bild-Sektionen ohne key", () => {
    const sections = normalizeSections([
      { type: "image", enabled: true, imageId: 1 },
      { type: "image", enabled: true, imageId: 2 },
    ]);
    const keys = sections.filter((s) => s.type === "image").map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("toleriert kaputte Eingaben", () => {
    expect(normalizeSections("kaputt" as unknown)).toEqual(defaultContent.sections);
    expect(normalizeSections([{ bogus: true }])).toEqual(defaultContent.sections);
  });

  it("erhaelt objectPosition/objectFit fuer Bild-Sektionen", () => {
    const sections = normalizeSections([
      {
        key: "img-1",
        type: "image",
        enabled: true,
        imageId: 1,
        objectPosition: "top",
        objectFit: "contain",
      },
    ]);
    const image = sections.find((s) => s.type === "image");
    expect(image?.objectPosition).toBe("top");
    expect(image?.objectFit).toBe("contain");
  });

  it("verwirft ungueltige objectFit-Werte", () => {
    const sections = normalizeSections([
      { key: "img-1", type: "image", enabled: true, imageId: 1, objectFit: "bogus" },
    ]);
    const image = sections.find((s) => s.type === "image");
    expect(image?.objectFit).toBeUndefined();
  });

  it("migriert den alten story-Singleton in eine Text-Sektion", () => {
    const sections = normalizeSections(
      [{ key: "story", type: "story", enabled: true }],
      "Unsere Geschichte",
      "Ein langer Text"
    );
    const text = sections.find((s) => s.type === "text");
    expect(text).toBeDefined();
    expect(text?.title).toBe("Unsere Geschichte");
    expect(text?.text).toBe("Ein langer Text");
  });

  it("erlaubt mehrere Text-Sektionen und erhaelt title/text", () => {
    const sections = normalizeSections([
      { key: "text-1", type: "text", enabled: true, title: "Titel 1", text: "Text 1" },
      { key: "text-2", type: "text", enabled: true, text: "Text 2" },
    ]);
    const texts = sections.filter((s) => s.type === "text");
    expect(texts).toHaveLength(2);
    expect(texts.find((s) => s.key === "text-1")?.title).toBe("Titel 1");
    expect(texts.find((s) => s.key === "text-2")?.title).toBeUndefined();
  });
});

describe("mergeContent (Story-Migration)", () => {
  it("uebernimmt storyTitle/storyText in eine Text-Sektion", () => {
    const merged = mergeContent(defaultContent, {
      storyTitle: "Our Story",
      storyText: "A long text",
      sections: [{ key: "story", type: "story", enabled: true }],
    } as unknown as Partial<SiteContent>);
    const text = merged.sections.find((s) => s.type === "text");
    expect(text?.title).toBe("Our Story");
    expect(text?.text).toBe("A long text");
  });
});

describe("sprachabhaengige Inhalte", () => {
  beforeEach(() => {
    getDb().prepare("DELETE FROM content").run();
  });

  afterEach(() => {
    getDb().prepare("DELETE FROM content").run();
  });

  it("liefert koreanische Defaults fuer Ablauf und FAQ", () => {
    expect(defaultContentKo.scheduleTitle).toBe("일정");
    expect(defaultContentKo.faqTitle).toBe("FAQ");
    expect(defaultContent.faqTitle).toBe("FAQ");
  });

  it("getContent('ko') liefert koreanische Standardtexte ohne DB-Daten", () => {
    const ko = getContent("ko");
    expect(ko.scheduleTitle).toBe("일정");
    expect(ko.faqTitle).toBe("FAQ");
    const text = ko.sections.find((s) => s.type === "text");
    expect(text?.title).toBe("우리의 이야기");
  });

  it("pflegt Textbloecke pro Sprache getrennt", () => {
    const de = { ...defaultContent };
    de.sections = de.sections.map((s) =>
      s.type === "text" ? { ...s, title: "Unsere Geschichte", text: "DE Text" } : s
    );
    saveContent(de, "de");

    const ko = { ...defaultContentKo };
    ko.sections = ko.sections.map((s) =>
      s.type === "text" ? { ...s, title: "우리의 이야기", text: "KO Text" } : s
    );
    saveContent(ko, "ko");

    const result = getContent("ko");
    const text = result.sections.find((s) => s.type === "text");
    expect(text?.title).toBe("우리의 이야기");
    expect(text?.text).toBe("KO Text");
  });

  it("neue DE-Text-Sektion ohne KO-Entsprechung faellt auf DE-Text zurueck", () => {
    const de = { ...defaultContent };
    de.sections = [
      ...de.sections,
      { key: "text-extra", type: "text", enabled: true, title: "Neu", text: "DE neu" },
    ];
    saveContent(de, "de");

    const result = getContent("ko");
    const text = result.sections.find((s) => s.key === "text-extra");
    expect(text?.title).toBe("Neu");
    expect(text?.text).toBe("DE neu");
  });
});

describe("Kontakt-Sektion", () => {
  it("ist standardmaessig deaktiviert", () => {
    const section = defaultContent.sections.find((s) => s.type === "contact");
    expect(section).toBeDefined();
    expect(section?.enabled).toBe(false);
  });

  it("ergaenzt eine fehlende Kontakt-Sektion deaktiviert", () => {
    const sections = normalizeSections([{ key: "map", type: "map", enabled: true }]);
    const contact = sections.find((s) => s.type === "contact");
    expect(contact).toBeDefined();
    expect(contact?.enabled).toBe(false);
  });

  it("liefert sprachabhaengige Defaults (DE/KO)", () => {
    expect(defaultContent.contactTitle).toBe("Kontakt");
    expect(defaultContent.contactName).toBe("Julian");
    expect(defaultContentKo.contactTitle).toBe("연락처");
  });

  it("pflegt Kontaktdaten pro Sprache getrennt", () => {
    const de = { ...defaultContent, contactName: "Julian", contactEmail: "julian@example.com" };
    saveContent(de, "de");

    const ko = {
      ...defaultContentKo,
      contactName: "지민",
      contactPhone: "+82 10 1234 5678",
      contactKakao: "kakao-id",
      contactEmail: "DE00 1234 5678 9000 00",
    };
    saveContent(ko, "ko");

    expect(getContent("de").contactName).toBe("Julian");
    expect(getContent("de").contactEmail).toBe("julian@example.com");
    expect(getContent("ko").contactName).toBe("지민");
    expect(getContent("ko").contactPhone).toBe("+82 10 1234 5678");
    expect(getContent("ko").contactKakao).toBe("kakao-id");
    expect(getContent("ko").contactEmail).toBe("DE00 1234 5678 9000 00");
  });
});

describe("translateKoreanContent", () => {
  it("uebersetzt deutsche Standard-Titel", () => {
    const translated = translateKoreanContent({
      ...defaultContent,
    } as Partial<SiteContent>);

    expect(translated.scheduleTitle).toBe("일정");
    expect(translated.faqTitle).toBe("FAQ");
    expect(translated.mapTitle).toBe("오시는 길");
    expect(translated.heroTitle).toBe("결혼합니다!");
    expect(translated.heroSubtitle).toBe("안나 & 요나스 · 2026년 9월 12일");
    expect(translated.locationName).toBe("무스터슈타트 성 정원");
    expect(translated.rsvpTitle).toBe("참석 여부를 알려주세요");
    expect(translated.rsvpSubtitle).toBe("2026년 8월 1일까지 알려주세요.");
  });

  it("uebersetzt auch den alten deutschen FAQ-Titel", () => {
    const translated = translateKoreanContent({ faqTitle: "Haeufige Fragen" });
    expect(translated.faqTitle).toBe("FAQ");
  });

  it("uebersetzt den Standard-Ablauf und die FAQ-Liste", () => {
    const translated = translateKoreanContent({
      schedule: defaultContent.schedule,
      faq: defaultContent.faq,
    });

    expect(translated.schedule).toEqual(defaultContentKo.schedule);
    expect(translated.faq).toEqual(defaultContentKo.faq);
  });

  it("uebersetzt den Standard-Story-Textblock", () => {
    const translated = translateKoreanContent({ sections: defaultContent.sections });
    const text = translated.sections?.find((s) => s.type === "text");
    const koStory = defaultContentKo.sections.find((s) => s.type === "text");
    expect(text?.title).toBe(koStory?.title);
    expect(text?.text).toBe(koStory?.text);
  });

  it("laesst individualisierte Werte unangetastet", () => {
    const translated = translateKoreanContent({
      scheduleTitle: "우리의 하루",
      faqTitle: "질문과 답변",
      schedule: [{ time: "10:00", title: "특별한 순간", description: "맞춤" }],
    });

    expect(translated.scheduleTitle).toBe("우리의 하루");
    expect(translated.faqTitle).toBe("질문과 답변");
    expect(translated.schedule).toEqual([
      { time: "10:00", title: "특별한 순간", description: "맞춤" },
    ]);
  });
});

describe("migrateKoreanContent (DB)", () => {
  beforeEach(() => {
    getDb().prepare("DELETE FROM content").run();
  });

  afterEach(() => {
    getDb().prepare("DELETE FROM content").run();
  });

  it("uebersetzt eine gespeicherte deutsche KO-Fassung", () => {
    // Deutsche Inhalte, wie sie frueher via "Aus Deutsch uebernehmen" nach KO
    // kopiert wurden.
    getDb()
      .prepare("INSERT INTO content (key, value_json) VALUES ('site:ko', ?)")
      .run(JSON.stringify(defaultContent));

    migrateKoreanContent(getDb());

    const ko = getContent("ko");
    expect(ko.scheduleTitle).toBe("일정");
    expect(ko.faqTitle).toBe("FAQ");
    expect(ko.schedule).toEqual(defaultContentKo.schedule);
    expect(ko.faq).toEqual(defaultContentKo.faq);
  });

  it("ist idempotent und veraendert die updated_at nicht erneut", () => {
    getDb()
      .prepare("INSERT INTO content (key, value_json) VALUES ('site:ko', ?)")
      .run(JSON.stringify(defaultContent));

    migrateKoreanContent(getDb());
    const afterFirst = getDb()
      .prepare("SELECT value_json, updated_at FROM content WHERE key = 'site:ko'")
      .get() as { value_json: string; updated_at: string };

    migrateKoreanContent(getDb());
    const afterSecond = getDb()
      .prepare("SELECT value_json, updated_at FROM content WHERE key = 'site:ko'")
      .get() as { value_json: string; updated_at: string };

    expect(afterSecond.value_json).toBe(afterFirst.value_json);
  });
});

describe("fixGermanUmlauts", () => {
  it("ersetzt den alten FAQ-Titel mit ausgeschriebenem Umlaut", () => {
    const fixed = fixGermanUmlauts({ faqTitle: "Haeufige Fragen" });
    expect(fixed.faqTitle).toBe("Häufige Fragen");
  });

  it("laesst bereits korrekte oder individualisierte Werte unangetastet", () => {
    expect(fixGermanUmlauts({ faqTitle: "FAQ" }).faqTitle).toBe("FAQ");
    expect(fixGermanUmlauts({ faqTitle: "Häufige Fragen" }).faqTitle).toBe("Häufige Fragen");
    expect(fixGermanUmlauts({ faqTitle: "Eigene Überschrift" }).faqTitle).toBe(
      "Eigene Überschrift"
    );
  });

  it("korrigiert den alten Story-Text in Text-Sektionen", () => {
    const legacyText =
      "Hier koennt ihr ein paar Worte ueber euch schreiben – wie ihr euch kennengelernt habt und warum ihr diesen Tag gemeinsam feiern moechtet.";
    const fixed = fixGermanUmlauts({
      sections: [{ key: "text-story", type: "text", enabled: true, text: legacyText }],
    });
    const section = fixed.sections?.find((s) => s.type === "text");
    expect(section?.text).toContain("könnt");
    expect(section?.text).not.toContain("koennt");
  });
});

describe("migrateGermanUmlauts (DB)", () => {
  beforeEach(() => {
    getDb().prepare("DELETE FROM content").run();
  });

  afterEach(() => {
    getDb().prepare("DELETE FROM content").run();
  });

  it("korrigiert den gespeicherten deutschen FAQ-Titel", () => {
    getDb()
      .prepare("INSERT INTO content (key, value_json) VALUES ('site:de', ?)")
      .run(JSON.stringify({ ...defaultContent, faqTitle: "Haeufige Fragen" }));

    migrateGermanUmlauts(getDb());

    expect(getContent("de").faqTitle).toBe("Häufige Fragen");
  });

  it("ist idempotent", () => {
    getDb()
      .prepare("INSERT INTO content (key, value_json) VALUES ('site:de', ?)")
      .run(JSON.stringify({ ...defaultContent, faqTitle: "Haeufige Fragen" }));

    migrateGermanUmlauts(getDb());
    const afterFirst = getDb()
      .prepare("SELECT value_json FROM content WHERE key = 'site:de'")
      .get() as { value_json: string };

    migrateGermanUmlauts(getDb());
    const afterSecond = getDb()
      .prepare("SELECT value_json FROM content WHERE key = 'site:de'")
      .get() as { value_json: string };

    expect(afterSecond.value_json).toBe(afterFirst.value_json);
  });
});
