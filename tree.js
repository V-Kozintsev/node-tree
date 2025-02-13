const fs = require("fs").promises;
const path = require("path");

function getArguments() {
  const args = process.argv.slice(2);
  let directory = ".";
  let depth = Infinity;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-d" || args[i] === "--depth") {
      depth = parseInt(args[i + 1], 10);
      i++;
    } else {
      directory = args[i];
    }
  }

  return { directory, depth };
}

async function printTree(directory, depth, indent = "") {
  let directoriesCount = 0;
  let filesCount = 0;

  try {
    const files = await fs.readdir(directory);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);

      const isLast = i === files.length - 1;
      const prefix = isLast ? "└── " : "├── ";

      console.log(indent + prefix + file);

      if (stats.isDirectory() && depth > 0) {
        directoriesCount++;
        const counts = await printTree(
          filePath,
          depth - 1,
          indent + (isLast ? "    " : "│   ")
        );
        directoriesCount += counts.directories;
        filesCount += counts.files;
      } else if (stats.isFile()) {
        filesCount++;
      }
    }
  } catch (error) {
    console.error(`Ошибка при чтении каталога ${directory}:`, error);
  }

  return { directories: directoriesCount, files: filesCount };
}

async function main() {
  const { directory, depth } = getArguments();

  try {
    console.log(directory);
    const { directories, files } = await printTree(directory, depth);
    console.log(`\n${directories} directories, ${files} files`);
  } catch (error) {
    console.error("Произошла ошибка:", error);
  }
}

main();
