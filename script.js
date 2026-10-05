const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (loginForm) {
    initLogin();
}

if (registerForm) {
    initRegister();
}

if (!loginForm && !registerForm && document.getElementById("video")) {
    initCamera();
}


function initLogin() {
    const form = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const remember = document.getElementById("remember");
    const message = document.getElementById("loginMessage");

    if (!form) {
        return;
    }

    const rememberedUsername =
        localStorage.getItem("ecamRemembered");

    if (rememberedUsername && usernameInput) {
        usernameInput.value = rememberedUsername;

        if (remember) {
            remember.checked = true;
        }
    }

    if (togglePassword && passwordInput) {
        togglePassword.onclick = () => {
            const visible =
                passwordInput.type === "text";

            passwordInput.type =
                visible ? "password" : "text";

            const icon =
                togglePassword.querySelector("span");

            if (icon) {
                icon.textContent = "◉";
            }
        };
    }

    form.onsubmit = async event => {
        event.preventDefault();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;

        message.textContent = "";
        message.className = "login-message";

        if (!username || !password) {
            message.textContent =
                "Please enter your username and password.";

            message.className =
                "login-message error";

            return;
        }

        const button =
            form.querySelector(".login-button");

        if (button) {
            button.disabled = true;
        }

        const formData = new FormData();

        formData.append(
            "username",
            username
        );

        formData.append(
            "password",
            password
        );

        try {
            const response =
                await fetch(
                    "api/login.php",
                    {
                        method: "POST",
                        body: formData,
                        credentials: "same-origin",
                        cache: "no-store"
                    }
                );

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "The server returned an invalid response."
                );
            }

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Incorrect username or password."
                );
            }

            sessionStorage.setItem(
                "ecamLoggedIn",
                "true"
            );

            sessionStorage.setItem(
                "ecamUser",
                data.user.username
            );

            sessionStorage.setItem(
                "ecamFullName",
                data.user.full_name || ""
            );

            sessionStorage.setItem(
                "ecamGmail",
                data.user.gmail || ""
            );

            if (
                remember &&
                remember.checked
            ) {
                localStorage.setItem(
                    "ecamRemembered",
                    username
                );
            } else {
                localStorage.removeItem(
                    "ecamRemembered"
                );
            }

            message.textContent =
                "Login successful.";

            message.className =
                "login-message success";

            setTimeout(() => {
                location.href = "camera.html";
            }, 250);

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            message.textContent =
                error.message ||
                "Unable to login.";

            message.className =
                "login-message error";

        } finally {
            if (button) {
                button.disabled = false;
            }
        }
    };
}


function initRegister() {
    const form =
        document.getElementById("registerForm");

    const message =
        document.getElementById("registerMessage");

    if (!form) {
        return;
    }

    form.onsubmit = async event => {
        event.preventDefault();

        const fullName =
            form.querySelector(
                '[name="fullName"]'
            )?.value.trim() || "";

        const username =
            form.querySelector(
                '[name="username"]'
            )?.value.trim() || "";

        const gmail =
            form.querySelector(
                '[name="gmail"]'
            )?.value.trim() || "";

        const password =
            form.querySelector(
                '[name="password"]'
            )?.value || "";

        const confirmPassword =
            form.querySelector(
                '[name="confirmPassword"]'
            )?.value || "";

        if (
            !fullName ||
            !username ||
            !gmail ||
            !password ||
            !confirmPassword
        ) {
            showRegisterMessage(
                message,
                "Please complete all fields.",
                "error"
            );

            return;
        }

        if (
            !/^[A-Za-z0-9_]{3,50}$/.test(username)
        ) {
            showRegisterMessage(
                message,
                "Username must be 3–50 characters and contain only letters, numbers, and underscores.",
                "error"
            );

            return;
        }

        if (
            !/^[^\s@]+@gmail\.com$/i.test(gmail)
        ) {
            showRegisterMessage(
                message,
                "Please enter a valid Gmail address.",
                "error"
            );

            return;
        }

        if (password.length < 6) {
            showRegisterMessage(
                message,
                "Password must be at least 6 characters.",
                "error"
            );

            return;
        }

        if (password !== confirmPassword) {
            showRegisterMessage(
                message,
                "Passwords do not match.",
                "error"
            );

            return;
        }

        const button =
            form.querySelector(
                'button[type="submit"]'
            );

        if (button) {
            button.disabled = true;
        }

        const formData =
            new FormData(form);

        try {
            const response =
                await fetch(
                    "api/register.php",
                    {
                        method: "POST",
                        body: formData,
                        credentials: "same-origin"
                    }
                );

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "The server returned an invalid response."
                );
            }

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Registration failed."
                );
            }

            showRegisterMessage(
                message,
                "Registration successful. Redirecting to login...",
                "success"
            );

            form.reset();

            setTimeout(() => {
                location.href = "index.html";
            }, 1000);

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            showRegisterMessage(
                message,
                error.message ||
                "Registration failed.",
                "error"
            );

        } finally {
            if (button) {
                button.disabled = false;
            }
        }
    };
}


function showRegisterMessage(
    element,
    text,
    type
) {
    if (!element) {
        return;
    }

    element.textContent = text;

    element.className =
        `register-message ${type}`;
}


async function initCamera() {
    if (
        sessionStorage.getItem(
            "ecamLoggedIn"
        ) !== "true"
    ) {
        location.href = "index.html";
        return;
    }

    const video =
        document.getElementById("video");

    const canvas =
        document.getElementById("canvas");

    const captureBtn =
        document.getElementById("captureBtn");

    const statusText =
        document.getElementById("statusText");

    const status =
        document.querySelector(".status");

    const zoom =
        document.getElementById("zoom");

    const zoomValue =
        document.getElementById("zoomValue");

    const zoomBadge =
        document.getElementById("zoomBadge");

    const qualityBadge =
        document.getElementById("qualityBadge");

    const gallery =
        document.getElementById("gallery");

    const dateOverlay =
        document.getElementById("dateOverlay");

    const historyModal =
        document.getElementById("historyModal");

    const historyGrid =
        document.getElementById("historyGrid");

    const historyEmpty =
        document.getElementById("historyEmpty");

    const previewWrap =
        document.getElementById("previewWrap");

    const recordingIndicator =
        document.getElementById(
            "videoRecordingIndicator"
        );

    const captureHint =
        document.getElementById(
            "captureHint"
        );


    let stream = null;

    let facingMode = "environment";

    let quality = "iphone";

    let filter = "original";

    let retro = "none";

    let mirror = false;

    let cameraCapabilities = null;

    let cameraTrack = null;

    let cameraReady = false;

    let currentMode = "photo";


    let mediaRecorder = null;

    let recordedChunks = [];

    let isRecordingVideo = false;

    let videoMimeType = "";

    let videoNumber =
        Number(
            localStorage.getItem(
                "ecamVideoNumber"
            ) || 0
        );


    let photoNumber =
        Number(
            localStorage.getItem(
                "ecamPhotoNumber"
            ) || 0
        );


    const username =
        sessionStorage.getItem(
            "ecamUser"
        );


    const filters = {
        original:
            "none",

        cinematic:
            "contrast(1.025) saturate(.94) brightness(1.01)",

        vivid:
            "contrast(1.045) saturate(1.08) brightness(1.015)",

        natural:
            "contrast(1.008) saturate(.985) brightness(1.008)"
    };


    function waitForVideo() {
        return new Promise(resolve => {

            if (
                video.readyState >= 3 &&
                video.videoWidth > 0
            ) {
                resolve();
                return;
            }

            const check = () => {

                if (
                    video.readyState >= 3 &&
                    video.videoWidth > 0
                ) {
                    video.removeEventListener(
                        "loadeddata",
                        check
                    );

                    video.removeEventListener(
                        "canplay",
                        check
                    );

                    resolve();
                }
            };

            video.addEventListener(
                "loadeddata",
                check
            );

            video.addEventListener(
                "canplay",
                check
            );

            setTimeout(
                resolve,
                3000
            );
        });
    }


    async function applyBestCameraSettings() {
        if (!cameraTrack) {
            return;
        }

        try {
            cameraCapabilities =
                cameraTrack.getCapabilities();

            const advanced = {};

            if (
                cameraCapabilities.focusMode &&
                cameraCapabilities.focusMode.includes(
                    "continuous"
                )
            ) {
                advanced.focusMode =
                    "continuous";
            }

            if (
                cameraCapabilities.exposureMode &&
                cameraCapabilities.exposureMode.includes(
                    "continuous"
                )
            ) {
                advanced.exposureMode =
                    "continuous";
            }

            if (
                cameraCapabilities.whiteBalanceMode &&
                cameraCapabilities.whiteBalanceMode.includes(
                    "continuous"
                )
            ) {
                advanced.whiteBalanceMode =
                    "continuous";
            }

            if (
                cameraCapabilities.resizeMode &&
                cameraCapabilities.resizeMode.includes(
                    "none"
                )
            ) {
                advanced.resizeMode =
                    "none";
            }

            if (
                cameraCapabilities.zoom
            ) {
                const min =
                    cameraCapabilities.zoom.min;

                const max =
                    cameraCapabilities.zoom.max;

                const current =
                    Math.min(
                        Math.max(
                            1,
                            min
                        ),
                        max
                    );

                advanced.zoom =
                    current;
            }

            if (
                Object.keys(advanced).length
            ) {
                await cameraTrack.applyConstraints({
                    advanced: [
                        advanced
                    ]
                });
            }

        } catch (error) {
            console.log(
                "Advanced camera settings unavailable:",
                error
            );
        }
    }


    async function startCamera() {
        if (isRecordingVideo) {
            stopVideoRecording();
        }

        if (stream) {
            stream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

            stream = null;
        }

        cameraReady = false;

        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error(
                    "Camera API is not supported."
                );
            }

            const constraints = {
                audio: false,

                video: {
                    facingMode: {
                        ideal: facingMode
                    },

                    width: {
                        min: 1280,
                        ideal: 3840,
                        max: 7680
                    },

                    height: {
                        min: 720,
                        ideal: 2160,
                        max: 4320
                    },

                    frameRate: {
                        ideal: 60,
                        min: 24,
                        max: 60
                    }
                }
            };

            try {
                stream =
                    await navigator.mediaDevices.getUserMedia(
                        constraints
                    );

            } catch {
                stream =
                    await navigator.mediaDevices.getUserMedia(
                        {
                            audio: false,

                            video: {
                                facingMode: {
                                    ideal: facingMode
                                },

                                width: {
                                    ideal: 1920
                                },

                                height: {
                                    ideal: 1080
                                },

                                frameRate: {
                                    ideal: 30
                                }
                            }
                        }
                    );
            }

            cameraTrack =
                stream.getVideoTracks()[0];

            video.srcObject =
                stream;

            await video.play();

            await waitForVideo();

            await applyBestCameraSettings();

            const settings =
                cameraTrack.getSettings();

            console.log(
                "ECam maximum camera settings:",
                settings
            );

            const width =
                settings.width ||
                video.videoWidth;

            const height =
                settings.height ||
                video.videoHeight;

            statusText.textContent =
                `${width}×${height}`;

            if (status) {
                status.classList.add(
                    "ready"
                );
            }

            cameraReady = true;

            applyPreview();

        } catch (error) {
            console.error(
                "Camera error:",
                error
            );

            cameraReady = false;

            statusText.textContent =
                "Camera permission required";

            if (status) {
                status.classList.remove(
                    "ready"
                );
            }

            alert(
                "ECam could not access the camera.\n\n" +
                "Allow camera permission and use ECam through localhost or HTTPS."
            );
        }
    }


    function buildFilter() {
        let value =
            filters[filter] ||
            filters.original;

        if (
            quality === "iphone"
        ) {
            value +=
                " contrast(1.008) saturate(1.012) brightness(1.006)";
        }

        if (
            quality === "cinematic"
        ) {
            value +=
                " contrast(1.025) saturate(.94)";
        }

        if (
            retro === "80s"
        ) {
            value +=
                " saturate(1.16) contrast(1.035) sepia(.045)";
        }

        if (
            retro === "90s"
        ) {
            value +=
                " sepia(.10) saturate(.92) contrast(1.025)";
        }

        if (
            retro === "kapi"
        ) {
            value +=
                " sepia(.18) saturate(.84) contrast(1.035) brightness(.99)";
        }

        return value;
    }


    function applyPreview() {
        if (!zoom) {
            return;
        }

        const z =
            Number(
                zoom.value || 1
            );

        if (zoomValue) {
            zoomValue.textContent =
                `${z.toFixed(1)}×`;
        }

        if (zoomBadge) {
            zoomBadge.textContent =
                `${z.toFixed(1)}×`;
        }

        video.style.filter =
            buildFilter();

        if (mirror) {
            video.style.transform =
                `scale(${z}) scaleX(-1)`;
        } else {
            video.style.transform =
                `scale(${z})`;
        }
    }


    document
        .querySelectorAll(".quality")
        .forEach(button => {

            button.onclick = () => {

                document
                    .querySelectorAll(".quality")
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                quality =
                    button.dataset.quality ||
                    "iphone";

                if (qualityBadge) {
                    qualityBadge.textContent =
                        quality === "iphone"
                            ? "Ecam Quality"
                            : quality
                                .charAt(0)
                                .toUpperCase() +
                              quality.slice(1);
                }

                applyPreview();
            };
        });


    document
        .querySelectorAll(".style")
        .forEach(button => {

            button.onclick = () => {

                document
                    .querySelectorAll(".style")
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                filter =
                    button.dataset.filter ||
                    "original";

                applyPreview();
            };
        });


    document
        .querySelectorAll(".retro")
        .forEach(button => {

            button.onclick = () => {

                document
                    .querySelectorAll(".retro")
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                retro =
                    button.dataset.retro ||
                    "none";

                applyPreview();
            };
        });


    if (zoom) {
        zoom.min = "0.5";
        zoom.max = "4";
        zoom.step = "0.1";

        if (
            Number(zoom.value) < 0.5
        ) {
            zoom.value = "0.5";
        }

        zoom.oninput =
            applyPreview;
    }


    function toggleButton(id) {
        const button =
            document.getElementById(id);

        if (!button) {
            return false;
        }

        const span =
            button.querySelector("span");

        button.classList.toggle(
            "on"
        );

        if (span) {
            span.textContent =
                button.classList.contains(
                    "on"
                )
                    ? "ON"
                    : "OFF";
        }

        return button.classList.contains(
            "on"
        );
    }


    const gridButton =
        document.getElementById(
            "gridBtn"
        );

    if (gridButton) {
        gridButton.onclick = () => {

            const overlay =
                document.getElementById(
                    "gridOverlay"
                );

            if (!overlay) {
                return;
            }

            overlay.classList.toggle(
                "show",
                toggleButton(
                    "gridBtn"
                )
            );
        };
    }


    const dateButton =
        document.getElementById(
            "dateBtn"
        );

    if (dateButton) {
        dateButton.onclick = () => {

            const on =
                toggleButton(
                    "dateBtn"
                );

            if (!dateOverlay) {
                return;
            }

            dateOverlay.classList.toggle(
                "show",
                on
            );

            if (on) {
                dateOverlay.textContent =
                    new Date().toLocaleString();
            }
        };
    }


    const mirrorButton =
        document.getElementById(
            "mirrorBtn"
        );

    if (mirrorButton) {
        mirrorButton.onclick = () => {

            mirror =
                toggleButton(
                    "mirrorBtn"
                );

            applyPreview();
        };
    }


    const flipButton =
        document.getElementById(
            "flipBtn"
        );

    if (flipButton) {
        flipButton.onclick = async () => {

            if (isRecordingVideo) {
                stopVideoRecording();
            }

            facingMode =
                facingMode === "user"
                    ? "environment"
                    : "user";

            await startCamera();
        };
    }


    document
        .querySelectorAll(".mode")
        .forEach(button => {

            button.onclick = () => {

                if (isRecordingVideo) {
                    return;
                }

                document
                    .querySelectorAll(".mode")
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                currentMode =
                    button.dataset.mode ||
                    "photo";

                if (captureBtn) {
                    captureBtn.classList.toggle(
                        "video-mode",
                        currentMode === "video"
                    );
                }

                if (captureHint) {
                    captureHint.classList.toggle(
                        "video-mode",
                        currentMode === "video"
                    );

                    captureHint.textContent =
                        currentMode === "video"
                            ? "Click the shutter to start recording"
                            : "ECam Is Created for better camera";
                }

                if (
                    currentMode === "photo"
                ) {
                    if (recordingIndicator) {
                        recordingIndicator.classList.remove(
                            "show"
                        );
                    }
                }
            };
        });


    function drawPhoto() {
        if (
            !cameraReady ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return null;
        }

        const width =
            video.videoWidth;

        const height =
            video.videoHeight;

        canvas.width =
            width;

        canvas.height =
            height;

        const context =
            canvas.getContext(
                "2d",
                {
                    alpha: false,
                    desynchronized: false
                }
            );

        context.imageSmoothingEnabled =
            true;

        context.imageSmoothingQuality =
            "high";

        context.save();

        if (mirror) {
            context.translate(
                width,
                0
            );

            context.scale(
                -1,
                1
            );
        }

        context.filter =
            buildFilter();

        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );

        context.restore();


        const dateEnabled =
            dateButton &&
            dateButton.classList.contains(
                "on"
            );

        if (dateEnabled) {
            context.save();

            context.font =
                `${Math.max(
                    18,
                    Math.round(
                        width / 95
                    )
                )}px Inter, sans-serif`;

            context.fillStyle =
                "#ffffff";

            context.shadowColor =
                "rgba(0,0,0,.9)";

            context.shadowBlur =
                6;

            context.fillText(
                new Date().toLocaleString(),
                35,
                height - 35
            );

            context.restore();
        }


        if (
            retro === "kapi" ||
            retro === "90s"
        ) {
            context.save();

            context.font =
                `${Math.max(
                    14,
                    Math.round(
                        width / 125
                    )
                )}px monospace`;

            context.fillStyle =
                "#ffffff";

            context.shadowColor =
                "rgba(0,0,0,.85)";

            context.shadowBlur =
                4;

            context.fillText(
                retro === "kapi"
                    ? "KAPI CAM"
                    : "ECAM 90s",
                35,
                45
            );

            context.restore();
        }

        return canvas;
    }


    async function uploadPicture(
        blob,
        filename
    ) {
        const formData =
            new FormData();

        formData.append(
            "picture",
            blob,
            filename
        );

        const response =
            await fetch(
                "api/upload_picture.php",
                {
                    method: "POST",
                    body: formData,
                    credentials: "same-origin"
                }
            );

        let data;

        try {
            data =
                await response.json();
        } catch {
            throw new Error(
                "Server returned an invalid response."
            );
        }

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                "Picture upload failed."
            );
        }

        return data;
    }


    async function getPictures() {
        const response =
            await fetch(
                "api/get_pictures.php",
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store"
                }
            );

        let data;

        try {
            data =
                await response.json();
        } catch {
            throw new Error(
                "Could not read picture history."
            );
        }

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                "Could not load picture history."
            );
        }

        return Array.isArray(
            data.pictures
        )
            ? data.pictures
            : [];
    }


    async function deletePicture(id) {
        const formData =
            new FormData();

        formData.append(
            "id",
            String(id)
        );

        const response =
            await fetch(
                "api/delete_picture.php",
                {
                    method: "POST",
                    body: formData,
                    credentials: "same-origin"
                }
            );

        let data;

        try {
            data =
                await response.json();
        } catch {
            throw new Error(
                "Server returned an invalid response."
            );
        }

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                "Could not delete picture."
            );
        }

        return data;
    }


    function escapeHTML(value) {
        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    async function renderHistory() {
        try {
            const rows =
                await getPictures();

            historyGrid.innerHTML =
                "";

            gallery.innerHTML =
                "";

            historyEmpty.style.display =
                rows.length
                    ? "none"
                    : "block";

            rows.forEach(row => {

                const imagePath =
                    row.image_path || "";

                const filename =
                    row.filename ||
                    "ECam Picture.jpg";

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "history-item";

                item.innerHTML = `
                    <img
                        src="${escapeHTML(imagePath)}"
                        alt="${escapeHTML(filename)}"
                    >

                    <div class="history-info">

                        <strong>
                            ${escapeHTML(filename)}
                        </strong>

                        <span>
                            ${
                                row.created_at
                                    ? escapeHTML(
                                        new Date(
                                            row.created_at
                                        ).toLocaleString()
                                    )
                                    : ""
                            }
                        </span>

                        <div>

                            <button
                                class="download-old"
                                type="button"
                            >
                                Save Again
                            </button>

                            <button
                                class="delete-old"
                                type="button"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;


                item
                    .querySelector(
                        ".download-old"
                    )
                    .onclick = () => {

                        const link =
                            document.createElement(
                                "a"
                            );

                        link.href =
                            imagePath;

                        link.download =
                            filename;

                        link.target =
                            "_blank";

                        document.body.appendChild(
                            link
                        );

                        link.click();

                        link.remove();
                    };


                item
                    .querySelector(
                        ".delete-old"
                    )
                    .onclick = async () => {

                        if (
                            !confirm(
                                `Delete ${filename}?`
                            )
                        ) {
                            return;
                        }

                        const button =
                            item.querySelector(
                                ".delete-old"
                            );

                        button.disabled =
                            true;

                        try {
                            await deletePicture(
                                row.id
                            );

                            await renderHistory();

                        } catch (error) {

                            console.error(
                                "Delete error:",
                                error
                            );

                            alert(
                                error.message ||
                                "Could not delete picture."
                            );

                            button.disabled =
                                false;
                        }
                    };


                historyGrid.appendChild(
                    item
                );


                if (
                    gallery.children.length < 5
                ) {
                    const image =
                        document.createElement(
                            "img"
                        );

                    image.className =
                        "thumb";

                    image.src =
                        imagePath;

                    image.alt =
                        filename;

                    image.title =
                        filename;

                    gallery.appendChild(
                        image
                    );
                }
            });


            if (!rows.length) {
                gallery.innerHTML =
                    '<div class="empty">No pictures yet.</div>';
            }

        } catch (error) {

            console.error(
                "History error:",
                error
            );

            historyGrid.innerHTML =
                `
                    <div class="empty">
                        Could not load picture history.
                    </div>
                `;

            gallery.innerHTML =
                `
                    <div class="empty">
                        No pictures yet.
                    </div>
                `;
        }
    }


    function openHistory() {
        if (!historyModal) {
            return;
        }

        historyModal.classList.add(
            "show"
        );

        renderHistory();
    }


    const historyButton =
        document.getElementById(
            "historyButton"
        );

    const historyButton2 =
        document.getElementById(
            "historyButton2"
        );

    const galleryButton =
        document.getElementById(
            "galleryBtn"
        );

    const closeHistory =
        document.getElementById(
            "closeHistory"
        );


    if (historyButton) {
        historyButton.onclick =
            openHistory;
    }

    if (historyButton2) {
        historyButton2.onclick =
            openHistory;
    }

    if (galleryButton) {
        galleryButton.onclick =
            openHistory;
    }

    if (closeHistory) {
        closeHistory.onclick = () => {
            historyModal.classList.remove(
                "show"
            );
        };
    }

    if (historyModal) {
        historyModal.onclick = event => {

            if (
                event.target ===
                historyModal
            ) {
                historyModal.classList.remove(
                    "show"
                );
            }
        };
    }


    async function stabilizeCamera() {
        try {
            await waitForVideo();

            if (
                "requestVideoFrameCallback"
                in video
            ) {
                await new Promise(
                    resolve => {

                        video.requestVideoFrameCallback(
                            () => {

                                video.requestVideoFrameCallback(
                                    () => {
                                        resolve();
                                    }
                                );
                            }
                        );
                    }
                );

            } else {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            300
                        )
                );
            }

        } catch {
            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        300
                    )
            );
        }
    }


    function getSupportedVideoMimeType() {
        if (
            !window.MediaRecorder
        ) {
            return "";
        }

        const types = [
            "video/mp4",
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm"
        ];

        for (const type of types) {
            if (
                MediaRecorder.isTypeSupported(
                    type
                )
            ) {
                return type;
            }
        }

        return "";
    }


    function startVideoRecording() {
        if (
            isRecordingVideo ||
            !cameraReady ||
            !stream
        ) {
            return;
        }

        if (
            !window.MediaRecorder
        ) {
            alert(
                "Video recording is not supported by this browser."
            );

            return;
        }

        const mimeType =
            getSupportedVideoMimeType();

        videoMimeType =
            mimeType || "video/webm";

        recordedChunks = [];


        try {
            mediaRecorder =
                mimeType
                    ? new MediaRecorder(
                        stream,
                        {
                            mimeType
                        }
                    )
                    : new MediaRecorder(
                        stream
                    );

        } catch (error) {
            console.error(
                "MediaRecorder error:",
                error
            );

            alert(
                "ECam could not start video recording."
            );

            return;
        }


        mediaRecorder.ondataavailable =
            event => {

                if (
                    event.data &&
                    event.data.size > 0
                ) {
                    recordedChunks.push(
                        event.data
                    );
                }
            };


        mediaRecorder.onstart = () => {

            isRecordingVideo =
                true;

            captureBtn.classList.add(
                "video-mode",
                "recording"
            );

            if (recordingIndicator) {
                recordingIndicator.classList.add(
                    "show"
                );
            }

            if (previewWrap) {
                previewWrap.classList.add(
                    "recording"
                );
            }

            if (status) {
                status.classList.add(
                    "recording"
                );

                status.classList.remove(
                    "ready"
                );
            }

            statusText.textContent =
                "Recording video...";

            if (captureHint) {
                captureHint.textContent =
                    "Click the shutter again to stop recording";

                captureHint.classList.add(
                    "video-mode"
                );
            }

            captureBtn.setAttribute(
                "aria-label",
                "Stop recording"
            );
        };


        mediaRecorder.onerror =
            event => {

                console.error(
                    "Video recording error:",
                    event
                );

                stopVideoRecording();
            };


        mediaRecorder.onstop = () => {

            const recorderType =
                mediaRecorder.mimeType ||
                videoMimeType ||
                "video/webm";

            const blob =
                new Blob(
                    recordedChunks,
                    {
                        type: recorderType
                    }
                );

            const isMP4 =
                recorderType
                    .toLowerCase()
                    .includes(
                        "mp4"
                    );

            const extension =
                isMP4
                    ? "mp4"
                    : "webm";


            videoNumber++;

            localStorage.setItem(
                "ecamVideoNumber",
                videoNumber
            );


            const filename =
                `ECam Video ${String(
                    videoNumber
                ).padStart(
                    3,
                    "0"
                )}.${extension}`;


            if (blob.size > 0) {

                const url =
                    URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href =
                    url;

                link.download =
                    filename;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();


                setTimeout(() => {
                    URL.revokeObjectURL(
                        url
                    );
                }, 1000);
            }


            isRecordingVideo =
                false;

            recordedChunks = [];

            captureBtn.classList.remove(
                "recording"
            );

            captureBtn.classList.add(
                "video-mode"
            );

            if (recordingIndicator) {
                recordingIndicator.classList.remove(
                    "show"
                );
            }

            if (previewWrap) {
                previewWrap.classList.remove(
                    "recording"
                );
            }

            if (status) {
                status.classList.remove(
                    "recording"
                );

                status.classList.add(
                    "ready"
                );
            }

            statusText.textContent =
                cameraTrack
                    ? `${cameraTrack.getSettings().width || video.videoWidth}×${cameraTrack.getSettings().height || video.videoHeight}`
                    : "Camera ready";

            if (captureHint) {
                captureHint.textContent =
                    "Click the shutter to start recording";

                captureHint.classList.add(
                    "video-mode"
                );
            }

            captureBtn.setAttribute(
                "aria-label",
                "Start recording"
            );

            mediaRecorder =
                null;

            videoMimeType =
                "";
        };


        try {
            mediaRecorder.start(
                1000
            );

        } catch (error) {

            console.error(
                "Could not start recording:",
                error
            );

            mediaRecorder =
                null;

            recordedChunks = [];

            alert(
                "ECam could not start video recording."
            );
        }
    }


    function stopVideoRecording() {
        if (
            !mediaRecorder ||
            mediaRecorder.state === "inactive"
        ) {
            return;
        }

        try {
            mediaRecorder.stop();
        } catch (error) {
            console.error(
                "Could not stop recording:",
                error
            );
        }
    }


    async function capturePhoto() {
        if (
            !cameraReady ||
            !video.videoWidth
        ) {
            return;
        }

        captureBtn.disabled =
            true;

        try {
            await stabilizeCamera();

            const photoCanvas =
                drawPhoto();

            if (!photoCanvas) {
                captureBtn.disabled =
                    false;

                return;
            }

            photoNumber++;

            localStorage.setItem(
                "ecamPhotoNumber",
                photoNumber
            );

            const filename =
                `ECam Picture ${String(
                    photoNumber
                ).padStart(
                    3,
                    "0"
                )}.jpg`;


            photoCanvas.toBlob(
                async blob => {

                    if (!blob) {
                        captureBtn.disabled =
                            false;

                        return;
                    }

                    const url =
                        URL.createObjectURL(
                            blob
                        );

                    const link =
                        document.createElement(
                            "a"
                        );

                    link.href =
                        url;

                    link.download =
                        filename;

                    document.body.appendChild(
                        link
                    );

                    link.click();

                    link.remove();


                    try {
                        await uploadPicture(
                            blob,
                            filename
                        );

                    } catch (error) {

                        console.error(
                            "Picture upload error:",
                            error
                        );

                        alert(
                            "The picture was downloaded, but it could not be saved to the server.\n\n" +
                            error.message
                        );
                    }


                    URL.revokeObjectURL(
                        url
                    );


                    await renderHistory();


                    setTimeout(
                        () => {
                            captureBtn.disabled =
                                false;
                        },
                        350
                    );

                },
                "image/jpeg",
                1.0
            );

        } catch (error) {

            console.error(
                "Photo capture error:",
                error
            );

            captureBtn.disabled =
                false;
        }
    }


    if (captureBtn) {

        captureBtn.onclick =
            async () => {

                if (
                    currentMode === "video"
                ) {

                    if (
                        isRecordingVideo
                    ) {
                        stopVideoRecording();

                    } else {
                        startVideoRecording();
                    }

                    return;
                }


                if (
                    captureBtn.disabled
                ) {
                    return;
                }

                await capturePhoto();
            };
    }


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.onclick =
            async () => {

                if (isRecordingVideo) {
                    stopVideoRecording();

                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                100
                            )
                    );
                }


                try {
                    await fetch(
                        "api/logout.php",
                        {
                            method: "POST",
                            credentials: "same-origin"
                        }
                    );

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );
                }


                if (stream) {
                    stream
                        .getTracks()
                        .forEach(
                            track =>
                                track.stop()
                        );
                }


                sessionStorage.removeItem(
                    "ecamLoggedIn"
                );

                sessionStorage.removeItem(
                    "ecamUser"
                );

                sessionStorage.removeItem(
                    "ecamFullName"
                );

                sessionStorage.removeItem(
                    "ecamGmail"
                );


                location.href =
                    "index.html";
            };
    }


    window.addEventListener(
        "beforeunload",
        () => {

            if (
                mediaRecorder &&
                mediaRecorder.state !== "inactive"
            ) {
                try {
                    mediaRecorder.stop();
                } catch {}
            }

            if (stream) {
                stream
                    .getTracks()
                    .forEach(
                        track =>
                            track.stop()
                    );
            }
        }
    );


    await startCamera();

    await renderHistory();
}