const fechRepeat = 30;
const token =
     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Im1hbmFnZXIiLCJuYmYiOjE3Mjc0MjExODAsImV4cCI6MTcyNzQ1NzE4MCwiaWF0IjoxNzI3NDIxMTgwLCJpc3MiOiJ3d3cuZmlyc2FwLmNvbSIsImF1ZCI6Ind3dy5maXJzYXAuY29tIn0.s_7I_DPLVz_KI3Yq34ilH-KR7s1dka9IEjnvXAK_ZDk";
const statusStadistics = {
     requestOk: 0,
     requestError: 0,
     requestErrorList: [],
     requestOkList: [],
};

const getPromise = (i) => {
     return new Promise(async (resolve, reject) => {
          await fetch("http://localhost:5281/api/test/allArticulos", {
               method: "GET",
               headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
               },
          })
               .then((response) => {
                    if (response.status === 200) {
                         statusStadistics.requestOk++;
                         statusStadistics.requestOkList.push(i);
                    } else {
                         statusStadistics.requestError++;
                         statusStadistics.requestErrorList.push(i);
                    }

                    resolve();
               })
               .catch((error) => {
                    console.error("Error:", error);
               });
     });
};

const promises = [];
for (let i = 0; i < fechRepeat; i++) {
     const count = i;
     const promise = getPromise(count);
     promises.push(promise);
}

Promise.all(promises).then((values) => {});
