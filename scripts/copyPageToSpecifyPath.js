const fs = require("fs");
const path = require("path");

// 本脚本主要针对模板路径所在文件的同一层级为目的地址进行复制，使用方法如下：(加--t就是使用模板)
// 1.只是复制单个文件或文件夹：node ./scripts/copyPageToSpecifyPath.js ../src/components/views/PIMSZdsz/AssetSystem/index.js test.js
// 2.只是复制模板路径中的文件：node ./scripts/copyPageToSpecifyPath.js Test --t
// 3.复制并替换模板路径中文件的内容：node ./scripts/copyPageToSpecifyPath.js Test true --t
// 注：在使用模板的前提下第二个参数为true就是进行替换内容，需要的话可以在第3，第4参数配置替换目标和替换值，默认是模板中最后的文件名以及新文件名

// 默认模板
// API项目>行为能力检测，复制脚本: node ./scripts/copyPageToSpecifyPath.js resizing true --t
const TEMPLATE = [
  "../src/servers/view/Study/basics/matrix",
  "../src/view/Study/basics/matrix",
];

// 单个文件或者文件夹复制，源路径，目的文件夹，新命名
function copyFileOrFolder(
  source,
  destination,
  newName,
  isTextReplace = false,
  replaceTarget,
  replaceValue
) {
  if (isTextReplace && !replaceTarget) {
    replaceTarget = source.split("/")?.pop();
    replaceValue = replaceValue ?? newName;
    if (!replaceTarget) {
      return console.error("未指定替换目标");
    }
  }

  const sourcePath = path.resolve(__dirname, source);
  const destinationPath = path.resolve(__dirname, destination, newName);

  // 检查源路径是否存在
  if (!fs.existsSync(sourcePath)) {
    console.error("copyFileOrFolder:源文件或文件夹不存在。");
    return;
  }

  // 检查目标路径是否已经存在
  if (fs.existsSync(destinationPath)) {
    console.error("copyFileOrFolder:目标文件或文件夹已经存在。");
    return;
  }

  // 如果源是文件夹，则递归复制整个文件夹
  const isDirectory = fs.lstatSync(sourcePath).isDirectory();
  if (isDirectory) {
    // 创建目录
    fs.mkdirSync(destinationPath);
    const files = fs.readdirSync(sourcePath);
    // console.log(files); // 文件名，带后缀的
    files.forEach((file) => {
      const newSource = path.join(sourcePath, file);
      let newFileName = file;
      if (isTextReplace) {
        // replaceAll 替换所有,但是会区分大小写
        newFileName = file.replaceAll(
          new RegExp(replaceTarget, "gi"),
          replaceValue
        );
      }
      copyFileOrFolder(
        newSource,
        destinationPath,
        newFileName,
        isTextReplace,
        replaceTarget,
        replaceValue
      );
    });
  } else {
    // 如果源是文件，则直接复制文件
    fs.copyFileSync(sourcePath, destinationPath);

    // 如果需要进行文本替换
    if (isTextReplace) {
      // 读取目标文件的内容
      let fileContent = fs.readFileSync(destinationPath, "utf8");
      fileContent = fileContent.replaceAll(
        new RegExp(replaceTarget, "gi"),
        replaceValue
      );
      // 将替换后的内容写入文件
      fs.writeFileSync(destinationPath, fileContent, "utf8");

      console.log(
        `copyFileOrFolder成功替换文件内容：${replaceTarget} --> ${replaceValue}`
      );
    }
  }

  console.log(
    `copyFileOrFolder成功复制一个${
      isDirectory === true ? "文件夹" : "文件"
    }：${source}-->${newName}`
  );
}

// 通过模板进行复制，新命名，是否开启文本替换（正则匹配，包含命名以及里面的内容）,文本替换目标
function copyToTemplate(newName, isTextReplace, replaceTarget, replaceValue) {
  // 默认替换目标为模板最后一个文件夹名字
  if (isTextReplace && !replaceTarget) {
    replaceTarget = TEMPLATE[0]?.split("/")?.pop();
    replaceValue = replaceValue ?? newName;
    if (!replaceTarget) {
      return console.error("未指定替换目标");
    }
  }
  console.log(
    "copyToTemplate开始复制：",
    newName,
    isTextReplace,
    replaceTarget
  );

  // 遍历模板数组，复制每个模板到目标路径
  let result = 0;
  for (let i = 0; i < TEMPLATE.length; i++) {
    const template = TEMPLATE[i];
    const sourcePath = path.resolve(__dirname, template);
    const destinationPath = path.resolve(
      __dirname,
      TEMPLATE[i]?.split("/")?.slice(0, -1).join("/"),
      newName
    );

    // 检查源路径是否存在
    if (!fs.existsSync(sourcePath)) {
      console.error(`copyToTemplate:模板文件或文件夹不存在：${template}`);
      return;
    }

    // 检查目标路径是否已经存在
    if (fs.existsSync(destinationPath)) {
      console.error(
        `copyToTemplate:目标文件或文件夹已经存在：${destinationPath}`
      );
      return;
    }

    // 如果源是文件夹，则递归复制整个文件夹
    const isDirectory = fs.lstatSync(sourcePath).isDirectory();
    if (isDirectory) {
      fs.mkdirSync(destinationPath);
      const files = fs.readdirSync(sourcePath);
      files.forEach((file) => {
        const newSource = path.join(sourcePath, file);
        let newFileName = file;
        if (isTextReplace) {
          newFileName = file.replaceAll(
            new RegExp(replaceTarget, "gi"),
            replaceValue
          );
        }
        copyFileOrFolder(
          newSource,
          destinationPath,
          newFileName,
          isTextReplace,
          replaceTarget,
          replaceValue
        );
      });
    } else {
      // 如果源是文件，则直接复制文件
      fs.copyFileSync(sourcePath, destinationPath);

      // 如果需要进行文本替换
      if (isTextReplace) {
        // 读取目标文件的内容
        let fileContent = fs.readFileSync(destinationPath, "utf8");
        fileContent = fileContent.replaceAll(
          new RegExp(replaceTarget, "gi"),
          replaceValue
        );
        // 将替换后的内容写入文件
        fs.writeFileSync(destinationPath, fileContent, "utf8");

        console.log(
          `copyToTemplate成功替换文件内容：${replaceTarget} --> ${replaceValue}`
        );
      }
    }

    console.log(
      `copyToTemplate成功复制一个${
        isDirectory ? "文件夹" : "文件"
      }：${template} --> ${newName}`
    );
    result++;
  }

  if (result === TEMPLATE.length) {
    console.log("copyToTemplate:------------全部复制完成!------------");
  } else {
    console.log(
      `copyToTemplate:---已复制${result}条路径所对应的文件或文件夹，剩余${
        TEMPLATE.length - result
      }条未复制-----`
    );
  }
}

// 这里就没有用命令行解析库，手搓吧
const parameterMap = {
  isUseTemplate: null,
  source: null,
  newName: null,
  isTextReplace: null,
  replaceTarget: null,
  replaceValue: null,
};
// 先确认是否使用模板
parameterMap.isUseTemplate = Boolean(
  process.argv
    .slice(2)
    .find(
      (val) => val.toLowerCase() === "--t" || val.toLowerCase() === "--template"
    )
);
// 再获取命令行参数，3种途径
process.argv.slice(2).forEach((val, index) => {
  // 1.缩写参数 暂不实现
  // if (val.toLowerCase() === "--r" || val.toLowerCase() === "--replace") {
  //   parameterMap.isTextReplace = true;
  // }
  if (val.includes("=")) {
    // 2.key=value 类型参数
    const [key, value] = val.split("=");
    parameterMap[key] = value;
  } else if (index < 5) {
    // 3.按顺序获取
    if (parameterMap.isUseTemplate) {
      if (index === 0) {
        parameterMap.newName = val;
      } else if (index === 1 && !val.includes("--")) {
        parameterMap.isTextReplace = val;
      } else if (index === 2 && !val.includes("--")) {
        parameterMap.replaceTarget = val;
      } else if (index === 3 && !val.includes("--")) {
        parameterMap.replaceValue = val;
      }
    } else {
      if (index === 0) {
        parameterMap.source = val;
      } else if (index === 1 && !val.includes("--")) {
        parameterMap.newName = val;
      } else if (index === 2 && !val.includes("--")) {
        parameterMap.isTextReplace = val;
      } else if (index === 3 && !val.includes("--")) {
        parameterMap.replaceTarget = val;
      } else if (index === 4 && !val.includes("--")) {
        parameterMap.replaceValue = val;
      }
    }
  }
});

console.log(parameterMap);

if (parameterMap.isUseTemplate) {
  copyToTemplate(
    parameterMap.newName,
    parameterMap.isTextReplace === null ? true : parameterMap.isTextReplace,
    parameterMap.replaceTarget,
    parameterMap.replaceValue
  );
} else {
  // 指定目标文件夹为源文件的同级目录
  const destination = path.dirname(parameterMap.source);
  copyFileOrFolder(
    parameterMap.source,
    destination,
    parameterMap.newName,
    parameterMap.isTextReplace === null ? true : parameterMap.isTextReplace,
    parameterMap.replaceTarget,
    parameterMap.replaceValue
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// TODO:参数有点多，后续优化成options配置
// TODO:当前是针对模板路径所在文件的同一层级进行复制的，后续增加指定复制路径的配置
