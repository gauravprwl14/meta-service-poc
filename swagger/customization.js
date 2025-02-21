const customStyles = `
.stream-response {
    background: #1e1e1e;
    color: #00ff00;
    font-family: monospace;
    padding: 10px;
    height: 400px;
    overflow-y: auto;
    margin: 10px 0;
    border-radius: 4px;
    position: relative;
}

.stream-line {
    margin: 5px 0;
    white-space: pre-wrap;
    word-break: break-all;
    animation: fadeIn 0.3s ease-in;
}

.stream-controls {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0,0,0,0.7);
    padding: 5px;
    border-radius: 4px;
}

.stream-button {
    background: #4a4a4a;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    margin-left: 5px;
}

.stream-button:hover {
    background: #5a5a5a;
}

.stream-line.error { color: #ff4444; }
.stream-line.warning { color: #ffbb33; }
.stream-line.success { color: #00C851; }
.stream-line.info { color: #33b5e5; }

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
`;

module.exports = { customStyles }; 