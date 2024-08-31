import React from 'react';

function App() {
    const apiKey = process.env.REACT_APP_API_KEY;  // 環境変数にアクセス
    console.log('Your API key:', apiKey);

    return (
        <div className="App">
            <h1>API Key: {apiKey ? 'Loaded' : 'Not Loaded'}</h1>
        </div>
    );
}

export default App;
