import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// GET /api/admin/vocabulary-words - Get words by setId
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const setId = searchParams.get("setId");

    if (!setId) {
      return NextResponse.json({ error: "Set ID is required" }, { status: 400 });
    }

    const words = await db.vocabularyWord.findMany({
      where: { vocabularySetId: setId },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ words });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch words" },
      { status: 500 }
    );
  }
}

// POST /api/admin/vocabulary-words - Create word
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      vocabularySetId,
      word,
      definition,
      partOfSpeech,
      pronunciation,
      exampleSentence,
      synonyms,
      antonyms,
      difficulty,
      audioUrl,
      imageUrl,
      scrambledWord,
      missingLetter,
    } = body;

    if (!vocabularySetId || !word || !definition) {
      return NextResponse.json(
        { error: "Set ID, word, and definition are required" },
        { status: 400 }
      );
    }

    // Generate scrambled word if not provided
    let scrambled = scrambledWord;
    if (!scrambled && word.length >= 3) {
      const chars = word.split("");
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      const shuffled = chars.join("");
      if (shuffled === word) {
        scrambled = shuffled + (word[0] === word[word.length - 1] ? word[1] : word[0]);
      } else {
        scrambled = shuffled;
      }
    }

    const newWord = await db.vocabularyWord.create({
      data: {
        vocabularySetId,
        word,
        definition,
        partOfSpeech: partOfSpeech || null,
        pronunciation: pronunciation || null,
        exampleSentence: exampleSentence || null,
        synonyms: synonyms ? JSON.stringify(synonyms) : null,
        antonyms: antonyms ? JSON.stringify(antonyms) : null,
        difficulty: difficulty || "MEDIUM",
        audioUrl: audioUrl || null,
        imageUrl: imageUrl || null,
        scrambledWord: scrambled || null,
        missingLetter: missingLetter || null,
      },
    });

    return NextResponse.json({ word: newWord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create word" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/vocabulary-words - Update word
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      word,
      definition,
      partOfSpeech,
      pronunciation,
      exampleSentence,
      synonyms,
      antonyms,
      difficulty,
      audioUrl,
      imageUrl,
      scrambledWord,
      missingLetter,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (word !== undefined) updateData.word = word;
    if (definition !== undefined) updateData.definition = definition;
    if (partOfSpeech !== undefined) updateData.partOfSpeech = partOfSpeech;
    if (pronunciation !== undefined) updateData.pronunciation = pronunciation;
    if (exampleSentence !== undefined) updateData.exampleSentence = exampleSentence;
    if (synonyms !== undefined) updateData.synonyms = synonyms ? JSON.stringify(synonyms) : null;
    if (antonyms !== undefined) updateData.antonyms = antonyms ? JSON.stringify(antonyms) : null;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (scrambledWord !== undefined) updateData.scrambledWord = scrambledWord;
    if (missingLetter !== undefined) updateData.missingLetter = missingLetter;

    const updated = await db.vocabularyWord.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ word: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update word" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/vocabulary-words - Delete word
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
    }

    await db.vocabularyWord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Word deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete word" },
      { status: 500 }
    );
  }
}
