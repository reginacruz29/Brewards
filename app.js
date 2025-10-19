// Brewards logic and UI helpers
(function(){
    // New goals and storage keys
    var GOAL_A = 120; // free fruit tea/coffee
    var GOAL_B = 150; // free praf
    var POINTS_KEY = 'brewards_points_v2';
    var PROFILE_KEY = 'brewards_profile_v1';
    var USER_ID_KEY = 'brewards_user_id';
    
    // Generate or get user ID
    function getUserId() {
        var id = localStorage.getItem(USER_ID_KEY);
        if (!id) {
            id = 'BR' + Math.floor(10000 + Math.random() * 90000); // Generate BR + 5 random digits
            localStorage.setItem(USER_ID_KEY, id);
        }
        return id;
    }

    function getPoints(){ return Number(localStorage.getItem(POINTS_KEY) || 0); }
    function setPoints(value){ localStorage.setItem(POINTS_KEY, String(value)); render(); }
    function getProfile(){ try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'); } catch(e){ return {}; } }
    function setProfile(profile){ localStorage.setItem(PROFILE_KEY, JSON.stringify(profile || {})); }

    // Common UI nodes
    var pill = document.getElementById('pointsPill');
    var progress120 = document.getElementById('progressBar120');
    var progress150 = document.getElementById('progressBar150');
    var label120 = document.getElementById('progressLabel120');
    var label150 = document.getElementById('progressLabel150');
    var reward120 = document.getElementById('reward120');
    var reward150 = document.getElementById('reward150');
    var qrImg = document.getElementById('personalQr');
    var helloName = document.getElementById('helloName');
    var claim120Btn = document.getElementById('claim120');
    var claim150Btn = document.getElementById('claim150');

    function render(){
        var points = getPoints();
        if (pill){ pill.textContent = points + ' PTS'; }
        if (progress120){ progress120.style.width = Math.min(100, Math.round((points/GOAL_A)*100)) + '%'; }
        if (progress150){ progress150.style.width = Math.min(100, Math.round((points/GOAL_B)*100)) + '%'; }
        if (label120){ label120.textContent = points + ' / ' + GOAL_A + ' pts'; }
        if (label150){ label150.textContent = points + ' / ' + GOAL_B + ' pts'; }
        if (reward120){ reward120.textContent = points >= GOAL_A ? 'Unlocked: Free Fruit Tea/Coffee/Milktea' : 'Next: Free Fruit Tea/Coffee/Milktea'; }
        if (reward150){ reward150.textContent = points >= GOAL_B ? 'Unlocked: Free Praf' : 'Next: Free Praf'; }

        // Personal QR and greeting
        var userId = getUserId();
        if (helloName){ 
            var profile = getProfile();
            helloName.textContent = profile.name ? ('Hi, ' + profile.name + '!') : 'Hi!';
            var idDisplay = document.getElementById('userId');
            if (idDisplay) { idDisplay.textContent = userId; }
        }
        if (qrImg){
            var data = encodeURIComponent(JSON.stringify({ 
                type: 'brewards_user', 
                userId: userId,
                profile: getProfile() 
            }));
            qrImg.src = 'sampleqr.png';
        }
        // Update reward card locked/unlocked visuals
        document.querySelectorAll('.rewards-grid .card')?.forEach(function(card){
            var cost = Number(card.getAttribute('data-cost') || 0);
            var label = card.getAttribute('data-reward') || 'Reward';
            var btn = card.querySelector('.card__footer .btn');
            if (cost && points < cost){
                card.classList.add('locked');
                card.setAttribute('data-locktext', '🔒 — need ' + (cost - points) + ' more');
                if (btn){ btn.disabled = true; }
            } else {
                card.classList.remove('locked');
                card.removeAttribute('data-locktext');
                if (btn){ btn.disabled = false; }
            }
        });
    }

    // Scan buttons (simulate kiosk increments)
    document.querySelectorAll('[data-inc]')?.forEach(function(btn){
        btn.addEventListener('click', function(){
            var inc = Number(btn.getAttribute('data-inc') || 0);
            setPoints(getPoints() + inc);
        });
    });

    // Account save/login logic on brewards-account.html
    var loginBtn = document.getElementById('loginBtn');
    if (loginBtn){
        loginBtn.addEventListener('click', function(){
            var email = (document.getElementById('emailInput') || {}).value || '';
            var password = (document.getElementById('passwordInput') || {}).value || '';
            if (!email){ showFeedback('Please enter your email to login.', 'error'); return; }
            if (!password){ showFeedback('Please enter your password.', 'error'); return; }
            var profile = getProfile() || {};
            var storedPassword = localStorage.getItem('brewards_password_v1') || '';
            if (!profile.email || profile.email.toLowerCase() !== email.toLowerCase()){
                showFeedback('No account found for that email. Please sign up first.', 'error');
                return;
            }
            if (password !== storedPassword){
                showFeedback('Incorrect password. Please try again.', 'error');
                return;
            }
            // Login success
            localStorage.setItem('brewards_signed_in', '1');
            showFeedback('Logged in successfully. Redirecting...', 'success');
            setTimeout(function(){ window.location.href = 'brewards-dashboard.html'; }, 700);
        });
    }

    // (Sign-in chooser and inline sign-in removed)

    // Footer year
    var yearNode = document.getElementById('year');
    if (yearNode){ yearNode.textContent = new Date().getFullYear(); }

    // Auto-inject size-price pills based on section (menu page)
    function injectSizePills(){
        var sections = {
            milktea: { medio: 29, grande: 39 },
            fruit: { medio: 29, grande: 39 },
            coffee: { medio: 29, grande: 39 },
            praf: { medio: 49, grande: 59 }
        };
        Object.keys(sections).forEach(function(keyName){
            var nodes = document.querySelectorAll('.sizes[data-section="' + keyName + '"]');
            nodes.forEach(function(node){
                var prices = sections[keyName];
                node.innerHTML = '<span class="size-pill"><b>Medio</b> ₱' + prices.medio + '</span>' +
                    ' <span class="size-pill"><b>Grande</b> ₱' + prices.grande + '</span>';
            });
        });
    }

    injectSizePills();
    render();

    // Feedback card (transient) - creates and shows a small on-page message
    function showFeedback(message, type){
        // type: 'error' | 'success' | 'info'
        var existing = document.querySelector('.feedback-card');
        if (existing){ existing.remove(); }
        var node = document.createElement('div');
        node.className = 'feedback-card feedback-card--' + (type || 'info');
        node.setAttribute('role','status');
        node.textContent = message;
        document.body.appendChild(node);
        // auto dismiss
        setTimeout(function(){
            node.classList.add('feedback-card--hide');
            setTimeout(function(){ try { node.remove(); } catch(e){} }, 400);
        }, 3200);
    }

    // Claim logic - deduct goal and keep remainder, with on-page feedback
    function tryClaim(cost, label){
        var pts = getPoints();
        if (pts < cost){
            var need = cost - pts;
            showFeedback('Not enough points. You need ' + need + ' more point' + (need>1?'s':'') + ' to redeem ' + (label||'this reward') + '.', 'error');
            return;
        }
        var remaining = pts - cost; // remainder preserved
        setPoints(remaining);
        showFeedback('Reward claimed: ' + (label||'Reward') + '. Remaining points: ' + remaining, 'success');
        // Generate a claim token and show QR modal for redemption
        var token = generateClaimToken();
        showClaimQrModal({ token: token, reward: label || 'Reward', pointsCost: cost });
    }

    // Simple token generator for claim (not cryptographically secure)
    function generateClaimToken(){
        var t = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9);
        return t;
    }

    // Show a modal with a QR code representing the claim token and reward info
    function showClaimQrModal(info){
        // remove existing modal if any
        var existing = document.getElementById('claimQrModal');
        if (existing) existing.remove();
        
        var modal = document.createElement('div');
        modal.id = 'claimQrModal';
        modal.className = 'claim-qr-modal';
        var inner = document.createElement('div');
        inner.className = 'claim-qr-modal__card';
        
        var title = document.createElement('div');
        title.className = 'claim-qr-modal__title';
        title.textContent = 'Show this code to claim: ' + (info.reward || 'Reward');
        
        // Add timer display
        var timerDisplay = document.createElement('div');
        timerDisplay.className = 'claim-qr-modal__timer';
        timerDisplay.textContent = '20:00';
        
        var qrImg = document.createElement('img');
        qrImg.className = 'claim-qr-modal__img';
        qrImg.src = 'sampleqr.png';  // Use the sample QR image instead
        qrImg.alt = 'Claim QR Code';
        
        var note = document.createElement('div');
        note.className = 'claim-qr-modal__note';
        note.textContent = 'Present this QR at the kiosk within the time limit. It will expire after 20 minutes.';
        
        var closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn--primary';
        closeBtn.textContent = 'Close';
        closeBtn.addEventListener('click', function(){ modal.remove(); });

        // Start the timer
        var timeLeft = 20 * 60; // 20 minutes in seconds
        function updateTimer() {
            var minutes = Math.floor(timeLeft / 60);
            var seconds = timeLeft % 60;
            timerDisplay.textContent = minutes.toString().padStart(2, '0') + ':' + 
                seconds.toString().padStart(2, '0');
            console.log('Timer updated:', timerDisplay.textContent); // Debug log
        }
        updateTimer(); // Show initial time
        var timer = setInterval(function() {
            timeLeft--;
            updateTimer();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                modal.remove(); // Close the modal when time runs out
            } else {
                timeLeft--;
            }
        }, 1000);

        inner.appendChild(title);
        inner.appendChild(timerDisplay);
        inner.appendChild(qrImg);
        inner.appendChild(note);
        inner.appendChild(closeBtn);
        modal.appendChild(inner);
        document.body.appendChild(modal);
    }

    if (claim120Btn){ claim120Btn.addEventListener('click', function(){ tryClaim(GOAL_A, 'Free Fruit Tea'); }); }
    if (claim150Btn){ claim150Btn.addEventListener('click', function(){ tryClaim(GOAL_B, 'Free Praf'); }); }

    // New buttons added in HTML for separate rewards
    var claimCoffee120Btn = document.getElementById('claimCoffee120');
    var claimMilkTea120Btn = document.getElementById('claimMilkTea120');
    if (claimCoffee120Btn){ claimCoffee120Btn.addEventListener('click', function(){ tryClaim(GOAL_A, 'Free Coffee'); }); }
    if (claimMilkTea120Btn){ claimMilkTea120Btn.addEventListener('click', function(){ tryClaim(GOAL_A, 'Free Milktea'); }); }
})();


