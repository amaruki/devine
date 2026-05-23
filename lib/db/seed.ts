const seed = process.argv[2];

if (seed !== "dev" && seed !== "qa") {
  throw new Error("Seed must be dev or qa");
}

console.log(`Seed ${seed} is ready for implementation.`);
