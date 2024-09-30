import { createSourceFile } from "typescript";
import fs from "fs";

interface Config {
     dir: string;
     dirName: string;
     token: string;
     urls: string[];
     fechRepeat: number;
}
interface stadistisRequestOk {
     status: number;
     url: string;
     method: string;
}
interface stadistisRequestError {
     status: number;
     url: string;
     method: string;
     message: string;
}
interface errorReport {
     cause: {
          errno: number;
          code: string;
          syscall: string;
          address: string;
          port: number;
     };
}
let config: Config | undefined = undefined;
const statusStadistics = {
     requestOk: 0,
     requestError: 0,
     requestErrorList: [] as stadistisRequestError[],
     requestOkList: [] as stadistisRequestOk[],
};
const errorReport: errorReport[] = [];

function getPromise(url) {
     return new Promise<void>(async (resolve, reject) => {
          await fetch(url, {
               method: "GET",
               headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config?.token}`,
               },
          })
               .then((response) => {
                    if (response.status === 200) {
                         statusStadistics.requestOk++;
                         const requestOk: stadistisRequestOk = {
                              status: response.status,
                              url: response.url,
                              method: response.type,
                         };
                         statusStadistics.requestOkList.push(requestOk);
                    } else {
                         statusStadistics.requestError++;
                         const requestError: stadistisRequestError = {
                              status: response.status,
                              url: response.url,
                              method: response.type,
                              message: response.statusText,
                         };
                         statusStadistics.requestErrorList.push(requestError);
                    }
                    resolve();
               })
               .catch((error) => {
                    errorReport.push(error);
                    resolve();
               });
     });
}
function verifyConfig() {
     if (!config?.token) {
          console.error("No token found in config file");
          return false;
     }
     if (!config?.urls) {
          console.error("No urls found in config file");
          return false;
     }
     if (!config?.dir) {
          console.error("No dir found in config file");
          return false;
     }
     if (!config?.dirName) {
          console.error("No dirName found in config file");
          return false;
     }
     if (!config?.fechRepeat) {
          console.error("No fechRepeat found in config file");
          return false;
     }

     return true;
}
const loadConfig = () => {
     const filePath = "apps/feching/config.feching.json";
     if (!fs.existsSync(filePath)) {
          console.error(`config.feching file not found at path: ${filePath}`);
          return null;
     }
     const file = fs.readFileSync(filePath, "utf8");
     config = JSON.parse(file);
};

function feching() {
     if (config === undefined) {
          console.error("Config file not loaded");
          return;
     }

     const promises: Promise<void>[] = [];
     if (!config?.urls) {
          console.error("No urls found in config file");
          return;
     }
     config?.urls.forEach((url) => {
          if (!config?.fechRepeat) {
               console.error("No fechRepeat found in config file");
               return;
          }
          for (let i = 0; i < config?.fechRepeat; i++) {
               const count = i;
               const promise = getPromise(url);
               promises.push(promise);
          }
     });
     Promise.all(promises).then(async (values) => {
          const items = [{ errorReports: errorReport }, { statusStadistics: statusStadistics }];
          if (!config?.dir) {
               console.error("No dir found in config file");
               return;
          }
          if (!config.dirName) {
               console.log("No dirName found in config file");
          }

          fs.writeFileSync(config?.dir + config.dirName, JSON.stringify(items));
     });
}

function main() {
     loadConfig();
     const isConfigTrusted = verifyConfig();
     if (isConfigTrusted) {
          feching();
     }
     
}

main();


