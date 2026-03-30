const $ = (id) => document.getElementById(id);
const radarCanvas = $("radar");
const radarTip = $("radar-tip");
let radarPoints = [];

const state = {
    profile: {
        name: "Neo Coder",
        bio: "永不止步的开发者，正在把创意变成现实。"
    },
    board: {
        dims: [82, 76, 88, 73, 85],
        labels: ["学习力", "执行力", "创造力", "协作力", "韧性值"],
        goals: [
            "完成个人作品集 2.0 版本上线",
            "建立每周复盘与迭代节奏",
            "每月输出一篇技术总结"
        ],
        tags: ["AI", "Design", "Game", "Music"],
        focus: "09:30 - 12:00",
        style: "异步优先 + 每周复盘"
    }
};

function load() {
    try {
        const p = localStorage.getItem("pm.profile");
        const b = localStorage.getItem("pm.board");
        if (p) state.profile = { ...state.profile, ...JSON.parse(p) };
        if (b) state.board = { ...state.board, ...JSON.parse(b) };
    } catch {}
}

function save() {
    try {
        localStorage.setItem("pm.profile", JSON.stringify(state.profile));
        localStorage.setItem("pm.board", JSON.stringify(state.board));
    } catch {}
}

function renderProfile() {
    $("name").textContent = state.profile.name;
    $("bio").textContent = state.profile.bio;
}

function renderBoard() {
    const goals = $("goals");
    goals.innerHTML = "";
    state.board.goals.forEach((g) => {
        const li = document.createElement("li");
        li.textContent = g;
        goals.appendChild(li);
    });

    $("focus").textContent = state.board.focus;
    $("style").textContent = state.board.style;

    const tags = $("tags");
    tags.innerHTML = "";
    state.board.tags.forEach((t) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = t;
        tags.appendChild(span);
    });

    drawRadar();
}

function drawRadar() {
    const cvs = radarCanvas;
    const ctx = cvs.getContext("2d");
    const w = cvs.width;
    const h = cvs.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = 95;
    const n = 5;

    ctx.clearRect(0, 0, w, h);

    for (let lv = 1; lv <= 5; lv++) {
        const r = (radius * lv) / 5;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const a = (Math.PI * 2 * i) / n - Math.PI / 2;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(180,200,230,0.25)";
        ctx.stroke();
    }

    for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(180,200,230,0.25)";
        ctx.stroke();

        const tx = cx + Math.cos(a) * (radius + 22);
        const ty = cy + Math.sin(a) * (radius + 22);
        ctx.fillStyle = "#d7e8ff";
        ctx.font = "12px Microsoft YaHei";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.board.labels[i], tx, ty);
    }

    radarPoints = [];
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const r = (radius * Math.max(0, Math.min(100, Number(state.board.dims[i]) || 0))) / 100;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        radarPoints.push({ x, y, label: state.board.labels[i], value: state.board.dims[i] });
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(64,232,255,0.28)";
    ctx.strokeStyle = "#40e8ff";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    radarPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#40e8ff";
        ctx.fill();
    });
}

function bindRadarHover() {
    radarCanvas.addEventListener("mousemove", (e) => {
        const rect = radarCanvas.getBoundingClientRect();
        const sx = radarCanvas.width / rect.width;
        const sy = radarCanvas.height / rect.height;
        const mx = (e.clientX - rect.left) * sx;
        const my = (e.clientY - rect.top) * sy;

        let hit = null;
        for (let i = 0; i < radarPoints.length; i++) {
            const p = radarPoints[i];
            const dx = mx - p.x;
            const dy = my - p.y;
            if (Math.sqrt(dx * dx + dy * dy) <= 10) {
                hit = p;
                break;
            }
        }

        if (hit) {
            radarTip.textContent = `${hit.label}: ${hit.value}`;
            radarTip.style.left = `${(hit.x / radarCanvas.width) * rect.width + 12}px`;
            radarTip.style.top = `${(hit.y / radarCanvas.height) * rect.height + 12}px`;
            radarTip.classList.remove("hide");
        } else {
            radarTip.classList.add("hide");
        }
    });

    radarCanvas.addEventListener("mouseleave", () => {
        radarTip.classList.add("hide");
    });
}

function bindProfile() {
    $("btn-profile").addEventListener("click", () => {
        const name = prompt("名字", state.profile.name);
        const bio = prompt("个人签名", state.profile.bio);
        if (name) state.profile.name = name;
        if (bio) state.profile.bio = bio;
        save();
        renderProfile();
    });

    $("btn-avatar").addEventListener("click", () => $("avatar-input").click());
    $("avatar-input").addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            $("avatar").src = reader.result;
            try { localStorage.setItem("pm.avatar", String(reader.result)); } catch {}
        };
        reader.readAsDataURL(file);
    });

    try {
        const a = localStorage.getItem("pm.avatar");
        if (a) $("avatar").src = a;
    } catch {}
}

function bindEditor() {
    const editor = $("editor");
    const ids = ["d1", "d2", "d3", "d4", "d5"];

    $("btn-board").addEventListener("click", () => {
        ids.forEach((id, i) => $(id).value = state.board.dims[i]);
        $("goals-input").value = state.board.goals.join("\n");
        $("tags-input").value = state.board.tags.join(", ");
        $("focus-input").value = state.board.focus;
        $("style-input").value = state.board.style;
        editor.classList.remove("hide");
    });

    $("btn-cancel").addEventListener("click", () => editor.classList.add("hide"));
    editor.addEventListener("click", (e) => {
        if (e.target === editor) editor.classList.add("hide");
    });

    $("btn-save").addEventListener("click", () => {
        state.board.dims = ids.map((id) => {
            const n = Number($(id).value);
            return Math.max(0, Math.min(100, Number.isNaN(n) ? 0 : n));
        });

        state.board.goals = $("goals-input").value
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 6);

        state.board.tags = $("tags-input").value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 10);

        state.board.focus = $("focus-input").value.trim() || "--";
        state.board.style = $("style-input").value.trim() || "--";

        save();
        renderBoard();
        editor.classList.add("hide");
    });
}

function startBackground() {
    const cvs = $("bg-canvas");
    const ctx = cvs.getContext("2d");
    let stars = [];
    let nebula = [];
    let particles = [];
    let tick = 0;
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
        cvs.width = window.innerWidth;
        cvs.height = window.innerHeight;
        stars = Array.from({ length: 110 }, () => ({
            x: Math.random() * cvs.width,
            y: Math.random() * cvs.height,
            r: Math.random() * 1.8 + 0.4,
            tw: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.005
        }));

        nebula = Array.from({ length: 6 }, () => ({
            x: Math.random() * cvs.width,
            y: Math.random() * cvs.height,
            r: Math.random() * 220 + 180,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            hue: 190 + Math.random() * 40
        }));

        const count = Math.max(70, Math.floor((cvs.width * cvs.height) / 22000));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * cvs.width,
            y: Math.random() * cvs.height,
            vx: (Math.random() - 0.5) * 0.42,
            vy: (Math.random() - 0.5) * 0.42,
            r: Math.random() * 1.8 + 0.9
        }));
    };

    const draw = () => {
        ctx.clearRect(0, 0, cvs.width, cvs.height);

        const grd = ctx.createRadialGradient(
            cvs.width * 0.2,
            cvs.height * 0.2,
            20,
            cvs.width * 0.5,
            cvs.height * 0.6,
            Math.max(cvs.width, cvs.height)
        );
        grd.addColorStop(0, "#121c2f");
        grd.addColorStop(0.45, "#0b1221");
        grd.addColorStop(1, "#060910");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        nebula.forEach((n) => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < -60 || n.x > cvs.width + 60) n.vx *= -1;
            if (n.y < -60 || n.y > cvs.height + 60) n.vy *= -1;

            const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            ng.addColorStop(0, `hsla(${n.hue}, 85%, 60%, 0.15)`);
            ng.addColorStop(1, `hsla(${n.hue}, 85%, 60%, 0)`);
            ctx.fillStyle = ng;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        });

        stars.forEach((s) => {
            s.tw += s.speed;
            const alpha = 0.35 + Math.sin(s.tw + tick) * 0.25;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(185, 226, 255, ${Math.max(0.1, alpha)})`;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > cvs.width) p.vx *= -1;
            if (p.y < 0 || p.y > cvs.height) p.vy *= -1;

            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const md = Math.sqrt(mdx * mdx + mdy * mdy);
            if (md < 120) {
                p.vx += mdx / 13000;
                p.vy += mdy / 13000;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(72, 231, 255, 0.78)";
            ctx.fill();
        }

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 90) {
                    const alpha = (90 - d) / 90 * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(104, 220, 255, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        tick += 0.008;

        requestAnimationFrame(draw);
    };

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    window.addEventListener("resize", resize);
    resize();
    draw();
}

load();
renderProfile();
renderBoard();
bindProfile();
bindEditor();
bindRadarHover();
startBackground();
