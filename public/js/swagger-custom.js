function createStreamViewer() {
    const container = document.createElement('div');
    container.className = 'stream-response';
    container.id = 'stream-output';

    const controls = document.createElement('div');
    controls.className = 'stream-controls';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'stream-button';
    clearBtn.onclick = () => container.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Stop';
    closeBtn.className = 'stream-button';
    closeBtn.onclick = () => window.currentEventSource?.close();

    controls.appendChild(clearBtn);
    controls.appendChild(closeBtn);
    container.appendChild(controls);

    return container;
}

function initializeStreamingResponse() {
    // Find the streaming endpoint section
    const streamEndpoint = Array.from(document.querySelectorAll('.opblock-summary-path')).find(
        el => el.textContent.includes('/setup/stream')
    );

    if (!streamEndpoint) return;

    const endpointBlock = streamEndpoint.closest('.opblock');
    if (!endpointBlock) return;

    // Find or create response section
    let responseSection = endpointBlock.querySelector('.try-out__response');
    if (!responseSection) {
        responseSection = document.createElement('div');
        responseSection.className = 'try-out__response';
        endpointBlock.appendChild(responseSection);
    }

    // Add stream viewer
    const streamViewer = createStreamViewer();
    responseSection.appendChild(streamViewer);

    // Setup execute button handler
    const executeButton = endpointBlock.querySelector('.try-out__btn');
    if (executeButton) {
        executeButton.addEventListener('click', function () {
            const envNameInput = endpointBlock.querySelector('input[placeholder="envName"]');
            if (!envNameInput?.value) {
                streamViewer.innerHTML = '<div class="stream-line error">Environment name is required</div>';
                return;
            }

            // Clear previous output
            streamViewer.innerHTML = '';

            // Close existing connection if any
            if (window.currentEventSource) {
                window.currentEventSource.close();
            }

            // Create new EventSource
            const eventSource = new EventSource(
                `http://localhost:5000/api/environment/setup/stream`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ envName: envNameInput.value })
                }
            );
            window.currentEventSource = eventSource;

            eventSource.onmessage = function (event) {
                try {
                    const data = JSON.parse(event.data);
                    const line = document.createElement('div');
                    line.className = `stream-line ${data.type || 'info'}`;
                    line.textContent = `[${data.phase}] ${data.message}`;
                    streamViewer.appendChild(line);
                    streamViewer.scrollTop = streamViewer.scrollHeight;
                } catch (error) {
                    console.error('Error parsing stream data:', error);
                }
            };

            eventSource.onerror = function (error) {
                const line = document.createElement('div');
                line.className = 'stream-line error';
                line.textContent = 'Stream ended or error occurred';
                streamViewer.appendChild(line);
                eventSource.close();
                delete window.currentEventSource;
            };
        });
    }
}

// Initialize when Swagger UI is ready
window.addEventListener('load', function () {
    const checkInterval = setInterval(function () {
        if (document.querySelector('.swagger-ui')) {
            clearInterval(checkInterval);
            initializeStreamingResponse();
        }
    }, 100);
}); 