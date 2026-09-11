/**
 * StudyMate AI – SDG 4 AI Learning Tutor
 * Frontend Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let currentLevel = localStorage.getItem('studymate_level') || 'beginner';
    let currentMode = 'explain';
    let currentSubject = 'general';
    let sessionId = localStorage.getItem('studymate_session_id');
    let lastQuizQuestion = null;

    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
        localStorage.setItem('studymate_session_id', sessionId);
    }

    // --- DOM Elements ---
    const chatContainer = document.getElementById('chatContainer');
    const messagesList = document.getElementById('messagesList');
    const welcomeCard = document.getElementById('welcomeCard');
    const messageInput = document.getElementById('messageInput');
    const chatForm = document.getElementById('chatForm');
    const sendBtn = document.getElementById('sendBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const exportChatBtn = document.getElementById('exportChatBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const navCurrentLevelBadge = document.getElementById('navCurrentLevelBadge');
    const inputLevelBadge = document.getElementById('inputLevelBadge');
    const inputModeBadge = document.getElementById('inputModeBadge');
    const inputSubjectBadge = document.getElementById('inputSubjectBadge');
    const providerIndicator = document.getElementById('providerIndicator');

    // Stats Elements
    const statScore = document.getElementById('statScore');
    const statStreakBadge = document.getElementById('statStreakBadge');
    const statAnswered = document.getElementById('statAnswered');
    const adaptiveStatusText = document.getElementById('adaptiveStatusText');
    const adaptiveProgressBar = document.getElementById('adaptiveProgressBar');

    // Configure Marked.js options
    if (window.marked) {
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (window.hljs && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return code;
            }
        });
    }

    // --- Initialize UI State ---
    syncLevelUI(currentLevel);
    initTheme();
    loadHistory();
    loadStats();

    // Copy sidebar content to mobile offcanvas
    const mobileSidebar = document.getElementById('mobileSidebarContent');
    const desktopSidebar = document.querySelector('.sidebar-panel');
    if (mobileSidebar && desktopSidebar) {
        mobileSidebar.innerHTML = desktopSidebar.innerHTML;
        bindSidebarEvents(mobileSidebar);
    }
    bindSidebarEvents(desktopSidebar);

    // --- Event Listeners ---

    // Level Radio Buttons
    function syncLevelUI(level) {
        currentLevel = level;
        localStorage.setItem('studymate_level', level);

        const radio = document.querySelector(`input[name="learningLevel"][value="${level}"]`);
        if (radio) radio.checked = true;

        if (navCurrentLevelBadge) navCurrentLevelBadge.textContent = capitalize(level);
        if (inputLevelBadge) inputLevelBadge.textContent = `Level: ${capitalize(level)}`;
    }

    // Handle Educational Mode and Subject buttons
    function bindSidebarEvents(container) {
        if (!container) return;

        // Mode buttons
        container.querySelectorAll('.btn-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
                const mode = btn.dataset.mode;
                currentMode = mode;
                
                // Set active class on all buttons with matching data-mode
                document.querySelectorAll(`.btn-mode[data-mode="${mode}"]`).forEach(b => b.classList.add('active'));
                if (inputModeBadge) inputModeBadge.textContent = `Mode: ${capitalize(mode)}`;

                // If user has text in input or there's an ongoing topic, suggest action
                const existingText = messageInput.value.trim();
                if (existingText) {
                    messageInput.focus();
                } else if (messagesList.children.length > 0) {
                    // Prompt to run mode on current topic
                    const lastMsg = messagesList.querySelector('.user-msg .user-bubble');
                    if (lastMsg && mode === 'quiz') {
                        messageInput.value = `Quiz me on this concept`;
                        messageInput.focus();
                    } else if (lastMsg && mode === 'example') {
                        messageInput.value = `Can you give me another clear example of this?`;
                        messageInput.focus();
                    } else if (lastMsg && mode === 'summarize') {
                        messageInput.value = `Summarize the key points we just discussed`;
                        messageInput.focus();
                    }
                }
            });
        });

        // Subject Pills
        container.querySelectorAll('.badge-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.badge-pill').forEach(p => p.classList.remove('active'));
                const subject = pill.dataset.subject;
                currentSubject = subject;
                document.querySelectorAll(`.badge-pill[data-subject="${subject}"]`).forEach(p => p.classList.add('active'));
                if (inputSubjectBadge) inputSubjectBadge.textContent = `Subject: ${capitalize(subject)}`;
            });
        });

        // Level Radio changes inside container
        container.querySelectorAll('input[name="learningLevel"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                syncLevelUI(e.target.value);
            });
        });
    }

    // Starter Prompt Buttons
    document.querySelectorAll('.starter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.dataset.query;
            const level = btn.dataset.level || currentLevel;
            const mode = btn.dataset.mode || currentMode;
            const subject = btn.dataset.subject || currentSubject;

            syncLevelUI(level);
            
            // Set mode and subject
            currentMode = mode;
            document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
            document.querySelectorAll(`.btn-mode[data-mode="${mode}"]`).forEach(b => b.classList.add('active'));
            if (inputModeBadge) inputModeBadge.textContent = `Mode: ${capitalize(mode)}`;

            currentSubject = subject;
            document.querySelectorAll('.badge-pill').forEach(p => p.classList.remove('active'));
            document.querySelectorAll(`.badge-pill[data-subject="${subject}"]`).forEach(p => p.classList.add('active'));
            if (inputSubjectBadge) inputSubjectBadge.textContent = `Subject: ${capitalize(subject)}`;

            sendMessage(query);
        });
    });

    // Form submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text) return;
        sendMessage(text);
        messageInput.value = '';
        autoResizeTextarea();
    });

    // Enter to send (Shift+Enter for newline)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Textarea Auto-expand
    messageInput.addEventListener('input', autoResizeTextarea);

    function autoResizeTextarea() {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    }

    // --- Message Dispatcher ---
    async function sendMessage(text) {
        if (!text.trim()) return;

        // Hide welcome card once conversation begins
        if (welcomeCard) welcomeCard.classList.add('d-none');

        // Check if user is answering a quiz (e.g. "A", "B", "C", "D")
        const cleanUpper = text.trim().toUpperCase();
        if (lastQuizQuestion && (['A', 'B', 'C', 'D'].includes(cleanUpper) || cleanUpper.startsWith('OPTION ') || cleanUpper.startsWith('ANSWER '))) {
            appendMessage('user', text);
            evaluateQuizDirectly(text, lastQuizQuestion);
            return;
        }

        // Regular Chat Message
        appendMessage('user', text);
        showTyping(true);

        try {
            const payload = {
                message: text,
                level: currentLevel,
                mode: currentMode,
                subject: currentSubject,
                session_id: sessionId
            };

            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server responded with status ${response.status}`);
            }

            const data = await response.json();
            showTyping(false);

            // Display Tutor message
            appendMessage('assistant', data.response, data.is_quiz);

            // Update stats
            if (data.stats) {
                updateStatsUI(data.stats);
            }

            // Update provider status
            if (providerIndicator) {
                const provName = data.provider === 'gemini' ? 'Gemini 1.5' : (data.provider === 'openai' ? 'OpenAI' : 'Offline SDG 4');
                providerIndicator.innerHTML = `<i class="bi bi-cpu text-success me-1"></i> ${provName}`;
            }

        } catch (err) {
            showTyping(false);
            appendErrorMessage(err.message || 'Could not connect to the tutor service. Please check your connection.');
        }
    }

    // --- Append Message to UI ---
    function appendMessage(role, content, isQuiz = false) {
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${role === 'user' ? 'user-msg' : 'tutor-msg'}`;

        if (role === 'user') {
            wrapper.innerHTML = `
                <div class="user-bubble">
                    ${escapeHtml(content)}
                </div>
            `;
        } else {
            const parsedHtml = window.marked ? marked.parse(content) : `<p>${escapeHtml(content)}</p>`;
            wrapper.innerHTML = `
                <div class="tutor-avatar">
                    <i class="bi bi-mortarboard-fill"></i>
                </div>
                <div class="tutor-bubble">
                    <div class="tutor-content">${parsedHtml}</div>
                    ${renderMessageActions(content)}
                </div>
            `;

            // Detect quiz questions to enable interactive button answering ONLY when isQuiz is true
            if (isQuiz) {
                detectAndAttachQuizInteractive(wrapper, content);
            }
        }


        messagesList.appendChild(wrapper);
        scrollToBottom();

        // Highlight syntax if code is present
        if (window.hljs) {
            wrapper.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    function renderMessageActions(rawText) {
        return `
            <div class="d-flex align-items-center gap-2 mt-2 pt-2 border-top border-secondary-subtle small text-muted">
                <button class="btn btn-sm btn-link text-muted p-0 copy-msg-btn" title="Copy to clipboard">
                    <i class="bi bi-clipboard me-1"></i> Copy
                </button>
                <span class="text-secondary">•</span>
                <button class="btn btn-sm btn-link text-muted p-0 quick-quiz-btn" title="Quiz me on this content">
                    <i class="bi bi-question-diamond me-1"></i> Practice Quiz
                </button>
            </div>
        `;
    }

    // Detect quiz in assistant output and append interactive A, B, C, D buttons
    function detectAndAttachQuizInteractive(wrapper, text) {
        const textLower = text.toLowerCase();
        if (textLower.includes('quiz') && (text.includes('- **A)**') || text.includes('- **B)**') || text.includes('A)') || text.includes('B)'))) {
            lastQuizQuestion = text; // Remember active quiz question

            const quizOptionsContainer = document.createElement('div');
            quizOptionsContainer.className = 'quiz-interactive-panel mt-3 p-3 bg-body-tertiary rounded-3 border';
            quizOptionsContainer.innerHTML = `
                <div class="small fw-bold text-danger mb-2">
                    <i class="bi bi-lightning-charge-fill me-1"></i> Tap your answer:
                </div>
                <div class="d-grid gap-2 d-sm-flex">
                    <button class="btn btn-outline-primary btn-sm quiz-choice-btn" data-choice="A">Option A</button>
                    <button class="btn btn-outline-primary btn-sm quiz-choice-btn" data-choice="B">Option B</button>
                    <button class="btn btn-outline-primary btn-sm quiz-choice-btn" data-choice="C">Option C</button>
                    <button class="btn btn-outline-primary btn-sm quiz-choice-btn" data-choice="D">Option D</button>
                </div>
            `;

            quizOptionsContainer.querySelectorAll('.quiz-choice-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const choice = btn.dataset.choice;
                    sendMessage(choice);
                });
            });

            const bubble = wrapper.querySelector('.tutor-bubble');
            if (bubble) bubble.appendChild(quizOptionsContainer);
        }
    }

    // --- Interactive Quiz Evaluation ---
    async function evaluateQuizDirectly(answer, questionText) {
        showTyping(true);
        try {
            const resp = await fetch('/api/quiz/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answer: answer,
                    question: questionText,
                    session_id: sessionId
                })
            });

            const data = await resp.json();
            showTyping(false);

            // Append evaluation card
            const evalWrapper = document.createElement('div');
            evalWrapper.className = 'message-wrapper tutor-msg';
            
            const isCorrect = data.is_correct;
            const badgeClass = isCorrect ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle';
            const icon = isCorrect ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger';

            evalWrapper.innerHTML = `
                <div class="tutor-avatar">
                    <i class="bi bi-mortarboard-fill"></i>
                </div>
                <div class="tutor-bubble">
                    <div class="p-3 rounded-3 ${badgeClass} mb-2">
                        <div class="d-flex align-items-center gap-2 fw-bold mb-1">
                            <i class="bi ${icon}"></i> ${isCorrect ? 'Correct! Well Done!' : 'Needs Review'}
                        </div>
                        <div class="small">${window.marked ? marked.parse(data.feedback) : data.feedback}</div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center small text-muted pt-1">
                        <span><strong>Score:</strong> ${data.total_score} pts (+${data.score_delta})</span>
                        <span><strong>Streak:</strong> ${data.streak} 🔥</span>
                        <span><strong>Level:</strong> ${capitalize(data.recommended_level)}</span>
                    </div>
                </div>
            `;

            messagesList.appendChild(evalWrapper);
            scrollToBottom();

            // Update stats
            updateStatsUI({
                score: data.total_score,
                streak: data.streak,
                total_questions: data.total_questions,
                current_level: data.recommended_level
            });

            // If level adapted
            if (data.recommended_level && data.recommended_level !== currentLevel) {
                syncLevelUI(data.recommended_level);
            }

            lastQuizQuestion = null; // Reset answered question

        } catch (err) {
            showTyping(false);
            appendErrorMessage('Could not evaluate quiz answer. Please try again.');
        }
    }

    // --- Message List Actions (Copy, Quick Quiz) ---
    messagesList.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-msg-btn');
        if (copyBtn) {
            const bubble = copyBtn.closest('.tutor-bubble');
            const content = bubble.querySelector('.tutor-content').innerText;
            navigator.clipboard.writeText(content).then(() => {
                copyBtn.innerHTML = '<i class="bi bi-check2 text-success me-1"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="bi bi-clipboard me-1"></i> Copy';
                }, 2000);
            });
            return;
        }

        const quickQuizBtn = e.target.closest('.quick-quiz-btn');
        if (quickQuizBtn) {
            currentMode = 'quiz';
            document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.btn-mode[data-mode="quiz"]').forEach(b => b.classList.add('active'));
            if (inputModeBadge) inputModeBadge.textContent = 'Mode: Quiz';
            sendMessage('Quiz me on the concept we just covered');
        }
    });

    // --- Typing Animation Indicator ---
    function showTyping(show) {
        if (show) {
            typingIndicator.classList.remove('d-none');
            typingIndicator.classList.add('d-flex');
            scrollToBottom();
        } else {
            typingIndicator.classList.add('d-none');
            typingIndicator.classList.remove('d-flex');
        }
    }

    function appendErrorMessage(msg) {
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper tutor-msg';
        wrapper.innerHTML = `
            <div class="tutor-avatar" style="background: #e11d48;">
                <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div class="tutor-bubble border-danger-subtle bg-danger-subtle text-danger">
                <strong>Notice:</strong> ${escapeHtml(msg)}
            </div>
        `;
        messagesList.appendChild(wrapper);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    // --- Update Learning Dashboard Stats ---
    function updateStatsUI(stats) {
        if (statScore) statScore.textContent = stats.score || 0;
        if (statStreakBadge) statStreakBadge.textContent = `${stats.streak || 0} Streak 🔥`;
        if (statAnswered) statAnswered.textContent = `${stats.total_questions || 0} answered`;

        const level = stats.current_level || currentLevel;
        if (adaptiveStatusText) {
            adaptiveStatusText.textContent = `${capitalize(level)} Track`;
        }

        // Update progress bar
        let progressVal = Math.min(100, Math.max(10, ((stats.score || 0) % 100)));
        if (adaptiveProgressBar) {
            adaptiveProgressBar.style.width = `${progressVal}%`;
        }
    }

    // --- Load History on Page Load ---
    async function loadHistory() {
        try {
            const resp = await fetch(`/api/history/${sessionId}`);
            if (!resp.ok) return;
            const data = await resp.json();
            if (data.messages && data.messages.length > 0) {
                if (welcomeCard) welcomeCard.classList.add('d-none');
                data.messages.forEach(msg => {
                    appendMessage(msg.role, msg.content);
                });
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }

    // --- Load Stats on Page Load ---
    async function loadStats() {
        try {
            const resp = await fetch(`/api/stats/${sessionId}`);
            if (!resp.ok) return;
            const stats = await resp.json();
            updateStatsUI(stats);
            if (stats.current_level) {
                syncLevelUI(stats.current_level);
            }
        } catch (e) {
            console.error('Failed to load stats:', e);
        }
    }

    // --- Clear Chat ---
    clearChatBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear your chat history and start fresh?')) return;
        try {
            await fetch('/api/clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
            messagesList.innerHTML = '';
            if (welcomeCard) welcomeCard.classList.remove('d-none');
            updateStatsUI({ score: 0, streak: 0, total_questions: 0, current_level: currentLevel });
        } catch (e) {
            alert('Failed to reset chat.');
        }
    });

    // --- Export Notes ---
    exportChatBtn.addEventListener('click', () => {
        const bubbles = messagesList.querySelectorAll('.message-wrapper');
        if (bubbles.length === 0) {
            alert('No study notes to export yet! Start a conversation first.');
            return;
        }

        let markdownContent = `# StudyMate AI – Study Session Notes\n`;
        markdownContent += `*UN SDG 4: Quality Education*\n`;
        markdownContent += `*Generated on: ${new Date().toLocaleString()}*\n\n---\n\n`;

        bubbles.forEach(wrapper => {
            const isUser = wrapper.classList.contains('user-msg');
            const text = isUser ? wrapper.querySelector('.user-bubble').innerText : wrapper.querySelector('.tutor-content').innerText;
            markdownContent += `### ${isUser ? '👤 Student' : '🎓 StudyMate AI'}\n\n${text}\n\n`;
        });

        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StudyMate_Notes_${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // --- Speech Recognition (Voice Input) ---
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let isListening = false;

        voiceBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
                voiceBtn.classList.add('text-danger');
                voiceBtn.innerHTML = '<i class="bi bi-mic-fill"></i>';
                isListening = true;
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            autoResizeTextarea();
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('text-danger');
            voiceBtn.innerHTML = '<i class="bi bi-mic"></i>';
            isListening = false;
        };

        recognition.onerror = () => {
            voiceBtn.classList.remove('text-danger');
            voiceBtn.innerHTML = '<i class="bi bi-mic"></i>';
            isListening = false;
        };
    } else {
        voiceBtn.style.display = 'none'; // Hide if not supported
    }

    // --- Google API Key Modal & Status Manager ---
    const googleApiStatusDot = document.getElementById('googleApiStatusDot');
    const googleApiNavStatus = document.getElementById('googleApiNavStatus');
    const googleKeyAlert = document.getElementById('googleKeyAlert');
    const googleKeyAlertText = document.getElementById('googleKeyAlertText');
    const googleApiKeyInput = document.getElementById('googleApiKeyInput');
    const googleModelSelect = document.getElementById('googleModelSelect');
    const googleKeyForm = document.getElementById('googleKeyForm');
    const saveGoogleKeyBtn = document.getElementById('saveGoogleKeyBtn');
    const saveKeySpinner = document.getElementById('saveKeySpinner');
    const saveKeyBtnText = document.getElementById('saveKeyBtnText');
    const toggleKeyVisibilityBtn = document.getElementById('toggleKeyVisibilityBtn');
    const toggleKeyIcon = document.getElementById('toggleKeyIcon');

    async function checkGoogleApiStatus() {
        try {
            const resp = await fetch('/api/google-key-status');
            if (!resp.ok) return;
            const data = await resp.json();

            if (data.is_configured) {
                if (googleApiStatusDot) {
                    googleApiStatusDot.className = 'badge rounded-pill bg-success ms-1';
                    googleApiStatusDot.textContent = 'Active';
                }
                if (googleApiNavStatus) {
                    googleApiNavStatus.textContent = 'Gemini Live';
                }
                if (googleKeyAlert) {
                    googleKeyAlert.className = 'alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3';
                    googleKeyAlertText.innerHTML = `<strong>Connected!</strong> Google Gemini (${data.model}) is active with key <code>${data.masked_key}</code>`;
                }
                if (googleModelSelect && data.model) {
                    googleModelSelect.value = data.model;
                }
                if (providerIndicator) {
                    providerIndicator.innerHTML = `<i class="bi bi-google text-danger me-1"></i> Gemini (${data.model})`;
                }
            } else {
                if (googleApiStatusDot) {
                    googleApiStatusDot.className = 'badge rounded-pill bg-secondary ms-1';
                    googleApiStatusDot.textContent = 'Offline';
                }
                if (googleApiNavStatus) {
                    googleApiNavStatus.textContent = 'Google API';
                }
                if (googleKeyAlert) {
                    googleKeyAlert.className = 'alert alert-warning d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3';
                    googleKeyAlertText.innerHTML = `<strong>Offline Mode:</strong> No Google API key connected. Enter your Gemini API key below to unlock live AI responses.`;
                }
            }
        } catch (err) {
            console.warn('Could not check Google API status:', err);
        }
    }

    checkGoogleApiStatus();

    // Toggle password visibility in modal
    if (toggleKeyVisibilityBtn && googleApiKeyInput) {
        toggleKeyVisibilityBtn.addEventListener('click', () => {
            if (googleApiKeyInput.type === 'password') {
                googleApiKeyInput.type = 'text';
                toggleKeyIcon.className = 'bi bi-eye-slash';
            } else {
                googleApiKeyInput.type = 'password';
                toggleKeyIcon.className = 'bi bi-eye';
            }
        });
    }

    // Submit Google API Key form
    if (googleKeyForm) {
        googleKeyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const keyVal = googleApiKeyInput.value.trim();
            const modelVal = googleModelSelect.value;

            if (!keyVal) {
                alert('Please enter a valid Google Gemini API Key.');
                return;
            }

            // Show loading spinner
            saveKeySpinner.classList.remove('d-none');
            saveKeyBtnText.textContent = 'Testing Key...';
            saveGoogleKeyBtn.disabled = true;

            try {
                const resp = await fetch('/api/set-google-key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ api_key: keyVal, model: modelVal })
                });

                const resData = await resp.json();
                saveKeySpinner.classList.add('d-none');
                saveGoogleKeyBtn.disabled = false;
                saveKeyBtnText.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Test & Save Key';

                if (resp.ok && resData.success) {
                    googleKeyAlert.className = 'alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3';
                    googleKeyAlertText.innerHTML = `🎉 <strong>Success!</strong> ${resData.message}`;
                    googleApiKeyInput.value = '';
                    checkGoogleApiStatus();

                    setTimeout(() => {
                        const modalEl = document.getElementById('googleApiModal');
                        const modalInstance = bootstrap.Modal.getInstance(modalEl);
                        if (modalInstance) modalInstance.hide();
                    }, 1800);
                } else {
                    googleKeyAlert.className = 'alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3';
                    googleKeyAlertText.innerHTML = `❌ <strong>Error:</strong> ${resData.error || 'Failed to validate Google API key.'}`;
                }
            } catch (err) {
                saveKeySpinner.classList.add('d-none');
                saveGoogleKeyBtn.disabled = false;
                saveKeyBtnText.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Test & Save Key';
                googleKeyAlert.className = 'alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3';
                googleKeyAlertText.innerHTML = `❌ <strong>Network Error:</strong> Could not connect to backend to verify key.`;
            }
        });
    }

    // --- Dark/Light Theme Handler ---
    function initTheme() {
        const savedTheme = localStorage.getItem('studymate_theme') || 'light';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        updateThemeIcon(savedTheme);

        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-bs-theme', next);
            localStorage.setItem('studymate_theme', next);
            updateThemeIcon(next);
        });
    }

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-sun-fill text-warning';
        } else {
            themeIcon.className = 'bi bi-moon-stars-fill';
        }
    }

    // --- Utilities ---
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
});
