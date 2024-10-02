import { createSourceFile } from "typescript";
import fs from "fs";

interface Config {
     dir: string;
     dirName: string;
     token: string;
     urls: string[];
     fechRepeat: number;
     fechContinue: boolean;
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
          setTimeout(async () => {
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
                              console.log(`Request Ok: ${response.url} ✅`);

                              statusStadistics.requestOkList.push(requestOk);
                         } else {
                              statusStadistics.requestError++;
                              const requestError: stadistisRequestError = {
                                   status: response.status,
                                   url: response.url,
                                   method: response.type,
                                   message: response.statusText,
                              };
                              console.log(`Request Error: ${response.url} ❌`);
                              statusStadistics.requestErrorList.push(requestError);
                         }
                         resolve();
                    })
                    .catch((error) => {
                         errorReport.push(error);
                         resolve();
                    });
          }, 2000);
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
function fechingContinue() {
     if (config === undefined) {
          console.error("Config file not loaded");
          return;
     }
     feching();
}
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
          let TotalerrorReports = statusStadistics.requestErrorList.length;
          let TotalRequestOk = statusStadistics.requestOk;
          const items = [
               { errorReports: errorReport },
               { statusStadistics: statusStadistics },
               { TotalerrorReports },
               { TotalRequestOk },
          ];
          if (!config?.dir) {
               console.error("No dir found in config file");
               return;
          }
          if (!config.dirName) {
               console.log("No dirName found in config file");
          }
          console.log(
               `TotalErrorReports:${TotalerrorReports} ❌ TotalRequestOk:${TotalRequestOk} ✅`,
          );
          console.log("Writing to file");
          fs.writeFileSync(config?.dir + config.dirName, JSON.stringify(items));
          if (config.fechContinue) {
               setTimeout(() => {
                    feching();
               }, 2000);
          }
     });
}
function main() {
     loadConfig();
     const isConfigTrusted = verifyConfig();
     if (isConfigTrusted) {
          fechingContinue();
     }
}

main();
