const fs = require("fs");
const { execSync } = require("child_process");

const OUTPUT_FILE_NAME = process.argv[2] || "moduleDependencies";
const INPORT_JSON_PATH = process.argv[3];
const PARENT_DIR = "./output";

const formatObjectToArray = (obj) => {
  return Object.keys(obj).map((moduleName) => {
    const currentModule = obj[moduleName];
    const dependencies = Object.keys(currentModule).includes("dependencies")
      ? formatObjectToArray(currentModule.dependencies)
      : [];
    return {
      moduleName,
      version: currentModule.version,
      dependencies,
    };
  });
};

const viewAllModule = (modules) => {
  modules.map(({ moduleName, dependencies }) => {
    console.log(moduleName);
    viewAllModule(dependencies);
  });
};

const main = async () => {
  const moduleTree = INPORT_JSON_PATH
    ? fs.readFileSync(INPORT_JSON_PATH)
    : execSync("npm ls -a --json").toString();
  const modules = formatObjectToArray(JSON.parse(moduleTree).dependencies);
  fs.writeFileSync(
    `./${PARENT_DIR}/${OUTPUT_FILE_NAME}.json`,
    JSON.stringify(modules)
  );
};

fs.stat(PARENT_DIR, (err, stats) => {
  if (err) {
    fs.mkdirSync(PARENT_DIR);
    main();
  } else {
    !stats.isDirectory() &&
      console.log(
        "既にoutputという名前のファイルが存在しているため、ディレクトリが作成できませんでした。"
      );
  }
});
