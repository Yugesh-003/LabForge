import { getDb, checkDatabaseHealth } from "../src/server/db/mongodb";
import { ensureDatabaseIndexes } from "../src/server/db/indexes";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("-----------------------------------------------------");
  console.log("Starting LabForge MongoDB Database Seeding...");
  console.log("-----------------------------------------------------");

  const health = await checkDatabaseHealth();
  if (!health.connected) {
    console.error(`MongoDB connection failed: ${health.error}`);
    console.error("Please ensure local MongoDB is running at mongodb://127.0.0.1:27017 or set MONGODB_URI in .env");
    process.exit(1);
  }

  const db = await getDb();
  await ensureDatabaseIndexes(db);

  // 1. Semester V (Batch 2024-2027)
  const semesterResult = await db.collection("semesters").findOneAndUpdate(
    { semesterNumber: 5, academicYear: "III Year (Batch 2024-2027)" },
    {
      $setOnInsert: {
        semesterNumber: 5,
        academicYear: "III Year (Batch 2024-2027)",
        name: "Semester V",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  const semesterDoc = semesterResult;
  console.log(`Semester V verified/created.`);

  // 2. Laboratories
  const labsData = [
    {
      code: "24DCS512 P",
      name: "Data Structures and Algorithm Practical",
      semesterNumber: 5,
      technology: "C++",
      workspaceType: "cpp",
      description: "To enable students to understand and apply object-oriented programming concepts and data structures for efficient problem solving using C++.",
    },
    {
      code: "24DCS511 P",
      name: "Natural Language Processing Lab",
      semesterNumber: 5,
      technology: "Python",
      workspaceType: "jupyter",
      description: "To teach the python library that suits for text processing with emphasis on various preprocessing steps to work on text.",
    },
    {
      code: "24DCS513 P",
      name: "NoSQL Database Management Practical",
      semesterNumber: 5,
      technology: "MongoDB and PyMongo",
      workspaceType: "mongodb",
      description: "To make the students to understand the basics of NoSQL and MongoDB concepts.",
    },
  ];

  const labMap: Record<string, any> = {};
  for (const labData of labsData) {
    const res = await db.collection("laboratories").findOneAndUpdate(
      { code: labData.code },
      {
        $setOnInsert: {
          ...labData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    labMap[labData.code] = res;
    console.log(`Laboratory verified/created: ${labData.name} (${labData.code})`);
  }

  // 3. User Accounts (Password hashing with bcrypt)
  const defaultPasswordHash = await bcrypt.hash("faculty123", 10);
  const studentPasswordHash = await bcrypt.hash("student123", 10);

  const facultyUsersData = [
    { name: "Dr. DSA Instructor", username: "faculty_dsa", passwordHash: defaultPasswordHash, role: "faculty" },
    { name: "Dr. NLP Instructor", username: "faculty_nlp", passwordHash: defaultPasswordHash, role: "faculty" },
    { name: "Dr. NoSQL Instructor", username: "faculty_nosql", passwordHash: defaultPasswordHash, role: "faculty" },
  ];

  const facultyMap: Record<string, any> = {};
  for (const fData of facultyUsersData) {
    const res = await db.collection("users").findOneAndUpdate(
      { username: fData.username },
      {
        $setOnInsert: {
          ...fData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    facultyMap[fData.username] = res;
    console.log(`Faculty account verified/created: ${fData.username}`);
  }

  // Student account
  const studentRes = await db.collection("users").findOneAndUpdate(
    { rollNumber: "242204" },
    {
      $setOnInsert: {
        name: "Arun Kumar",
        rollNumber: "242204",
        passwordHash: studentPasswordHash,
        role: "student",
        academicYear: "III Year",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  console.log(`Student account verified/created: 242204`);

  // 4. Faculty Assignments
  const assignments = [
    { facultyId: facultyMap["faculty_dsa"]._id, laboratoryId: labMap["24DCS512 P"]._id, semesterNumber: 5 },
    { facultyId: facultyMap["faculty_nlp"]._id, laboratoryId: labMap["24DCS511 P"]._id, semesterNumber: 5 },
    { facultyId: facultyMap["faculty_nosql"]._id, laboratoryId: labMap["24DCS513 P"]._id, semesterNumber: 5 },
  ];

  for (const assign of assignments) {
    await db.collection("facultyAssignments").updateOne(
      { facultyId: assign.facultyId, laboratoryId: assign.laboratoryId },
      { $setOnInsert: { ...assign, createdAt: new Date(), updatedAt: new Date() } },
      { upsert: true }
    );
  }
  console.log(`Faculty assignments verified/created.`);

  // 5. OFFICIAL SYLLABUS PRACTICAL EXERCISES (40 TOTAL)

  // DSA Exercises (14)
  const dsaLabId = labMap["24DCS512 P"]._id;
  const dsaFacultyId = facultyMap["faculty_dsa"]._id;
  const dsaTitles = [
    "Create a C++ program to demonstrate Classes and Objects.",
    "Create a C++ program to demonstrate Constructor and Destructor.",
    "Create a C++ program to demonstrate inheritance.",
    "Create a C++ program to demonstrate Polymorphism.",
    "Create a C++ program to demonstrate Exception Handling.",
    "Create a C++ program to demonstrate the List ADT using arrays.",
    "Create a C++ program to demonstrate the List ADT using linked lists.",
    "Create a C++ program to demonstrate the Stack ADT.",
    "Create a C++ program to demonstrate the Queue ADT.",
    "Create a C++ program to demonstrate the Tree Traversal Algorithms.",
    "Create a C++ program to demonstrate the Binary Search Tree ADT.",
    "Create a C++ program to demonstrate the Merge Sort.",
    "Create a C++ program to demonstrate the Quick Sort.",
    "Create a C++ program to demonstrate the Graph Traversal Algorithms.",
  ];

  let dsaCount = 0;
  for (let i = 0; i < dsaTitles.length; i++) {
    const title = dsaTitles[i];
    const num = i + 1;
    const res = await db.collection("exercises").updateOne(
      { laboratoryId: dsaLabId, exerciseNumber: num },
      {
        $setOnInsert: {
          exerciseNumber: num,
          title: title,
          question: title,
          description: `Official Syllabus Practical Exercise #${num} for Data Structures and Algorithm Practical (24DCS512 P).`,
          examples: [],
          constraints: "C++17 ISO standard compilation.",
          testCases: [{ id: `dsa-tc-${num}`, input: "sample_input", expectedOutput: "expected_output" }],
          laboratoryId: dsaLabId,
          semesterNumber: 5,
          createdBy: dsaFacultyId,
          type: "mandatory",
          status: "published",
          difficulty: num <= 5 ? "Easy" : num <= 11 ? "Medium" : "Hard",
          topic: num <= 5 ? "Object Oriented Programming" : "Data Structure & Algorithm",
          objective: "Apply OOP concepts and data structures using C++.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    if (res.upsertedCount > 0) dsaCount++;
  }

  // NLP Exercises (15)
  const nlpLabId = labMap["24DCS511 P"]._id;
  const nlpFacultyId = facultyMap["faculty_nlp"]._id;
  const nlpTitles = [
    "Tokenization: Write a program to split a given sentence into words and sentences.",
    "Stopword Removal: Implement a script to remove stopwords from a text.",
    "POS Tagging: Use NLTK or SpaCy to perform part-of-speech tagging on a given sentence.",
    "Named Entity Recognition (NER): Identify named entities in a paragraph using SpaCy.",
    "Basic Regular Expressions: Use regex to extract email addresses and phone numbers from a text file.",
    "TF-IDF Calculation: Compute the TF-IDF values for words in a document corpus.",
    "N-gram Language Model: Implement a bigram language model to predict the next word in a sentence.",
    "Sentiment Analysis: Build a sentiment classifier using Naïve Bayes.",
    "Topic Modeling: Perform topic modeling on a dataset using Latent Dirichlet Allocation (LDA).",
    "Word Embeddings: Train and visualize word embeddings using Word2Vec or GloVe.",
    "Text Summarization: Implement extractive text summarization using the TextRank algorithm.",
    "Machine Translation: Build a simple English-to-French translation model using Transformer-based models like BERT.",
    "Chatbot Development: Develop a simple rule-based or deep learning-based chatbot.",
    "Speech-to-Text System: Use a speech recognition API to convert spoken language into text.",
    "Bias Detection in NLP: Analyze and mitigate biases in a text classification model.",
  ];

  let nlpCount = 0;
  for (let i = 0; i < nlpTitles.length; i++) {
    const title = nlpTitles[i];
    const num = i + 1;
    const res = await db.collection("exercises").updateOne(
      { laboratoryId: nlpLabId, exerciseNumber: num },
      {
        $setOnInsert: {
          exerciseNumber: num,
          title: title,
          question: title,
          description: `Official Syllabus Program #${num} for Natural Language Processing Lab (24DCS511 P).`,
          examples: [],
          constraints: "Python 3.11 with NLTK / SpaCy / scikit-learn environment.",
          testCases: [{ id: `nlp-tc-${num}`, input: "sample_text", expectedOutput: "tokens_or_result" }],
          laboratoryId: nlpLabId,
          semesterNumber: 5,
          createdBy: nlpFacultyId,
          type: "mandatory",
          status: "published",
          difficulty: num <= 5 ? "Easy" : num <= 10 ? "Medium" : "Hard",
          topic: "Text Preprocessing & NLP Pipeline",
          objective: "Implement Python NLP preprocessing steps.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    if (res.upsertedCount > 0) nlpCount++;
  }

  // NoSQL Exercises (11)
  const nosqlLabId = labMap["24DCS513 P"]._id;
  const nosqlFacultyId = facultyMap["faculty_nosql"]._id;
  const nosqlTitles = [
    "Install, configure, and manage the MongoDB server across different operating systems",
    "Create, switch, list, and delete databases in MongoDB",
    "Create, view, and remove collections dynamically",
    "Perform CRUD operations including insert, query, update, and delete documents",
    "Use basic aggregation pipeline stages like match, group, project, sort, and limit",
    "Apply advanced aggregation techniques such as averages, joins, and array unwinding",
    "Implement indexing and analyze query performance for optimization",
    "Work with geospatial data and perform location-based queries",
    "Manage database security, user roles, and backup/restore operations",
    "Integrate MongoDB with Python using pymongo for data operations and analysis",
    "Use MongoDB for real-world data analysis and trend identification",
  ];

  let nosqlCount = 0;
  for (let i = 0; i < nosqlTitles.length; i++) {
    const title = nosqlTitles[i];
    const num = i + 1;
    const res = await db.collection("exercises").updateOne(
      { laboratoryId: nosqlLabId, exerciseNumber: num },
      {
        $setOnInsert: {
          exerciseNumber: num,
          title: title,
          question: title,
          description: `Official Syllabus Practical Program #${num} for NoSQL Database Management Practical (24DCS513 P).`,
          examples: [],
          constraints: "MongoDB Shell 7.0 / PyMongo integration.",
          testCases: [{ id: `nosql-tc-${num}`, input: "mongo_cmd", expectedOutput: "acknowledged" }],
          laboratoryId: nosqlLabId,
          semesterNumber: 5,
          createdBy: nosqlFacultyId,
          type: "mandatory",
          status: "published",
          difficulty: num <= 4 ? "Easy" : num <= 8 ? "Medium" : "Hard",
          topic: "MongoDB & NoSQL Administration",
          objective: "Understand MongoDB database administration and query processing.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    if (res.upsertedCount > 0) nosqlCount++;
  }

  console.log("-----------------------------------------------------");
  console.log("Database Seed Summary:");
  console.log(`- DSA Practical (24DCS512 P): 14 Exercises Verified`);
  console.log(`- NLP Lab (24DCS511 P): 15 Exercises Verified`);
  console.log(`- NoSQL Practical (24DCS513 P): 11 Exercises Verified`);
  console.log(`- Total Official Syllabus Exercises: 40`);
  console.log("Seeding complete! Database is ready for LabForge.");
  console.log("-----------------------------------------------------");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Fatal error during database seeding:", err);
  process.exit(1);
});
