document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#generate-btn').addEventListener('click', generateHandleClick);
    document.querySelector('#clear-btn').addEventListener('click', clearHandleClick);
    refreshHistoricList();
    refreshTypes();
});

let types = [
    {
        text: "CPF",
        value: 'cpf',
        active: true
    },
    {
        text: "CURP",
        value: 'curp',
        active: false
    },
]

function generateHandleClick() {
    const typeSelect = document.querySelector('#type-select');

    addToHistoric(
        {
            value: gerarCpf(), 
            text: typeSelect.options[typeSelect.selectedIndex].textContent, 
            datetime: getCurrentDateTime()
        }
    );
}

function clearHandleClick() {
    chrome.storage.local.set({ historic: [] }).then(() => {
        refreshHistoricList();
    });
}

function addToHistoric(tempObj) {
    chrome.storage.local.get(["historic"]).then((result) => {
        if (!Array.isArray(result.historic)) {
            chrome.storage.local.set({ historic: [tempObj] });
        } else {
            chrome.storage.local.set({ historic: [tempObj, ...result.historic] });
        }
    }).then(() => {
        refreshHistoricList();
    });
}

function removeFromHistoric(value) {
    chrome.storage.local.get(["historic"]).then((result) => {
        const tempHistoric = result.historic.filter((item) => item.value != value);

        chrome.storage.local.set({ historic: tempHistoric });
    }).then(() => {
        refreshHistoricList();
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

function getCurrentDateTime() {
    const now = new Date();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return now.toLocaleDateString('pt-BR', options);
}

function refreshHistoricList() {
    chrome.storage.local.get(["historic"], function (result) {
        if (result.historic && Array.isArray(result.historic)) {
            const historicList = document.getElementById('historic-list');
            historicList.innerHTML = '';

            for (const item of result.historic) {
                const listItem = document.createElement('li');
                listItem.classList.add('historic-item');

                for (const key in item) {
                    const h2 = document.createElement('h2');
                    h2.textContent = item[key];
                    listItem.appendChild(h2);
                }

                const actionsDiv = document.createElement('div');
                actionsDiv.classList.add('historic-item-actions');

                const copyButton = document.createElement('button');
                copyButton.classList.add('btn', 'success');
                copyButton.textContent = 'Copy';
                copyButton.onclick = () => {copyToClipboard(item.value)};
                actionsDiv.appendChild(copyButton);

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('btn', 'danger');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => {removeFromHistoric(item.value)};
                actionsDiv.appendChild(deleteButton);

                listItem.appendChild(actionsDiv);

                historicList.appendChild(listItem);
                
            }
        }
    });
}

function refreshTypes() {
    const typeSelect = document.querySelector('#type-select');

    typeSelect.innerHTML = '';

    for (const type of types) {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.text;
        if (!type.active) {
            option.disabled = true;
        }
        typeSelect.appendChild(option);
    }
}


function gerarCpf() {
    const num1 = aleatorio();
    const num2 = aleatorio();
    const num3 = aleatorio();
    const dig1 = dig(num1, num2, num3);
    const dig2 = dig(num1, num2, num3, dig1);
    return `${num1}.${num2}.${num3}-${dig1}${dig2}`;
}

function dig(n1, n2, n3, n4) { 
    const nums = n1.split("").concat(n2.split(""), n3.split(""));
    if (n4 !== undefined){ 
        nums[9] = n4;
    }

    let x = 0;
    for (let i = (n4 !== undefined ? 11:10), j = 0; i >= 2; i--, j++) {
        x += parseInt(nums[j]) * i;
    }

    const y = x % 11;
    return y < 2 ? 0 : 11 - y; 
}

function aleatorio() {
    const aleat = Math.floor(Math.random() * 999);
    return ("" + aleat).padStart(3, '0'); 
}