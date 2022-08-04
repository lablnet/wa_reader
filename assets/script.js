// Regex https://stackoverflow.com/a/57542867/12175903
const regexParser =
    /^(\d{1,2})\/(\d{1,2})\/(\d\d), (24:00|2[0-3]:[0-5][0-9]|[0-1][0-9]:[0-5][0-9]) - (\S[^:]*?): (.*)$/i;

// Function to parse the string and return an array.
function makeArrayOfMessages(lines) {
    return lines.reduce((acc, line) => {
        if (!regexParser.test(line) && typeof acc[acc.length - 1] !== 'undefined') {
            // The message is a part of the previous message.
            const prevMessage = acc.pop();
            acc.push({
                msg: `${prevMessage.msg}\n${line}`,
            });
        } else {
            acc.push({
                msg: line,
            });
        }
        return acc;
    }, []);
    return acc;
}

document.getElementById("formFile").addEventListener("change", function () {
    var file = this.files[0];
    // check that file extension is .txt
    if (file.name.split('.').pop() != "txt") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'File must be a .txt file',
        });
        return;
    }
    var data = [];
    // Read the content of .txt file.
    var reader = new FileReader();
    reader.onload = function (e) {
        let text = e.target.result;
        // Split the text into lines.
        lines = makeArrayOfMessages(text.split(/(?:\r\n|\r|\n)/))
        lines.forEach(function (line) {
            line = line.msg;
            // check that line is not empty               
            if (line.length > 0) {
                let lineData = line.split(/-(.*)/s);
                let date = lineData[0];
                if (lineData.length >= 2) {

                    lineData = lineData[1].split(/:(.*)/s);
                    let name = lineData[0];
                    let text = lineData[1];
                    if (lineData.length >= 2 && text != ' <Media omitted>') {
                        data.push({
                            date: date,
                            name: name,
                            msg: text
                        });
                    }
                }
            }
        });
    }
    reader.readAsText(file);
    // check if reader is done.

    reader.onloadend = function () {
        let name = "";
        // Get distnic name from data.
        let distinctNames = new Set(data.map(function (item) {
            // trim name to remove whitespace
            return item.name.trim();
        }));
        // convert set to object.
        let distinctNamesObj = {};
        distinctNames.forEach(el => distinctNamesObj[el] = el);
        Swal.fire({
            icon: 'info',
            title: "Name",
            text: "Select your name from given list",
            input: "select",
            inputPlaceholder: "Name",
            inputOptions: {
                ...distinctNamesObj
            },
            allowOutsideClick: false,
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    // check value is in the list of names.
                    if (value && distinctNames.has(value)) {
                        name = value;
                        resolve();
                    } else {
                        resolve('You need to select a name');
                    }
                });
            },
        }).then((result) => {
            let chat = document.getElementById("chat");
            data.forEach(function (item) {
                let div = document.createElement("div")
                if (item.name.trim() == name.trim()) {
                    div.classList = "ml-auto break-all w-6/12 mt-2 mb-1 p-2 rounded-br-none bg-blue-500 rounded-2xl text-white text-left mr-5";
                    let p1 = document.createElement("p");
                    p1.className = "text-xs text-white font-bold";
                    p1.innerText = item.name;
                    div.appendChild(p1);
                    let p2 = document.createElement("p");
                    p2.className = "text-sm";
                    p2.innerText = item.msg;
                    div.appendChild(p2);
                    let p3 = document.createElement("p");
                    p3.className = "text-xs text-white float-right";
                    p3.innerText = item.date;
                    div.appendChild(p3);
                } else {
                    div.classList = "break-all mt-2 w-6/12  ml-5 rounded-bl-none float-none bg-gray-300 mr-auto rounded-2xl p-2";
                    let p1 = document.createElement("p");
                    p1.className = "text-xs text-black font-bold";
                    p1.innerText = item.name;
                    div.appendChild(p1);
                    let p2 = document.createElement("p");
                    p2.className = "text-sm";
                    p2.innerText = item.msg;
                    div.appendChild(p2);
                    let p3 = document.createElement("p");
                    p3.className = "text-xs text-gray-500 float-right";
                    p3.innerText = item.date;
                    div.appendChild(p3);
                }
                chat.append(div);
            });
            document.getElementById("select-file").style.display = "none";
            document.getElementById("msg").style.display = "block";
        })
    }
});
