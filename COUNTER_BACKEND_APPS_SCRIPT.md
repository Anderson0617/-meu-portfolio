## Backend do contador via Google Apps Script Web App

1. Crie um novo projeto em [https://script.google.com](https://script.google.com) e cole o código abaixo:

```javascript
const COUNTER_PROPERTY = "visitantes";
const LOCK = LockService.getScriptLock();

function _getValue(start) {
  const props = PropertiesService.getScriptProperties();
  const stored = props.getProperty(COUNTER_PROPERTY);
  if (stored === null) {
    props.setProperty(COUNTER_PROPERTY, String(start));
    return Number(start);
  }
  return Number(stored);
}

function _setValue(value) {
  PropertiesService.getScriptProperties().setProperty(COUNTER_PROPERTY, String(value));
  return value;
}

function _respond(value, callback) {
  const payload = { value: Number(value) };
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(payload)})`).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e.parameter.action || "get").toLowerCase();
  const callback = e.parameter.callback;
  const start = Number(e.parameter.start) || 373;
  let value;

  LOCK.waitLock(5000);
  try {
    value = _getValue(start);
    if (action === "hit") {
      value = _setValue(value + 1);
    }
    if (action === "get") {
      value = _getValue(start);
    }
  } finally {
    LOCK.releaseLock();
  }

  return _respond(value, callback);
}
```

2. Clique em **Implantar > Nova implantação**.
3. Escolha “Aplicativo da Web”, defina “Quem tem acesso” como “Qualquer pessoa” e copie o URL resultante.
4. Use esse URL como `COUNTER_API_BACKEND_URL` no `script.js`.

> Sempre que precisar redefinir o valor inicial para 373, basta ajustar `PropertiesService` manualmente via editor das propriedades ou script seco. Não exponha rota `reset`.
