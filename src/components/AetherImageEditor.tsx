
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { generateInitialPrompt } from '@/ai/flows/generate-initial-prompt';
import { improvePromptClarity } from '@/ai/flows/improve-prompt-clarity';
import { editImage } from '@/ai/flows/edit-image-flow';
import { describeImage } from '@/ai/flows/describe-image-flow';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brush, Wand2, Download, Trash2, Loader2, Upload, Eraser, Eye, EyeOff, ArrowLeft, Settings, Lightbulb, LightbulbOff, Sun, Moon, Languages, Undo2, KeyRound, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Switch } from './ui/switch';

const Logo = () => (
    <a href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
        <svg viewBox="0 0 2553 2504" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary">
            <g filter="url(#filter0_d_399_5237)">
                <path fillRule="evenodd" clipRule="evenodd" d="M1235.1 66.199C1233.59 55.9868 1215.71 56.0076 1214.22 66.2233C1089.39 923.6 420.193 1183.69 12.0884 1256.51C2.10762 1258.29 2.91261 1274.89 12.9555 1276.28C887.549 1397.19 1147.18 2080.59 1217.98 2489.65C1219.68 2499.46 1235.29 2499.44 1236.97 2489.63C1306.82 2080.4 1564.86 1396.4 2439.17 1273.46C2449.21 1272.05 2449.98 1255.45 2439.99 1253.69C2031.72 1181.81 1361.93 923.284 1235.1 66.199Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M2119.61 10.8123C2118.76 5.72148 2109.21 5.73261 2108.37 10.8254C2060.24 302.399 1833.78 396.219 1688.52 424.415C1683.54 425.381 1683.86 434.063 1688.87 434.835C1988.87 481.101 2082.73 714.303 2110.01 860.373C2110.92 865.265 2119.04 865.256 2119.94 860.362C2146.88 714.229 2240.2 480.81 2540.09 433.847C2545.09 433.063 2545.39 424.38 2540.42 423.426C2395.09 395.567 2168.41 302.274 2119.61 10.8123Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M455.846 1722.29C454.794 1717.24 444.079 1717.25 443.039 1722.31C408.828 1888.64 280.54 1948.29 190.49 1968.64C185.546 1969.75 185.845 1979.23 190.827 1980.17C365.065 2012.92 425.112 2147.32 444.67 2238.67C445.712 2243.53 454.383 2243.52 455.414 2238.65C474.76 2147.27 534.495 2012.72 708.657 1979.57C713.637 1978.62 713.913 1969.14 708.966 1968.03C618.869 1947.9 490.444 1888.54 455.846 1722.29Z" fill="currentColor"/>
            </g>
            <defs>
                <filter id="filter0_d_399_5237" x="0" y="0" width="2553" height="2504" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="2"/>
                <feGaussianBlur stdDeviation="3.5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.365385 0 0 0 0 0.365385 0 0 0 0 0.365385 0 0 0 0.2 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_399_5237"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_399_5237" result="shape"/>
                </filter>
            </defs>
        </svg>
        <span className="font-headline">Genie</span>
    </a>
);

const translations = {
  en: {
    yourPersonalEditor: 'Your Personal AI Photo Editor',
    bringYourOwnKey: 'Bring your own Gemini API key to remove unwanted objects, people, or text, or get creative and modify your images with a text prompt.',
    clickOrDrag: 'Click here or drag an image file',
    tryWithExample: 'Or try with an example',
    startNew: 'Start New',
    togglePreview: 'Preview original',
    togglePreviewActive: 'Show edited version',
    download: 'Download',
    settings: 'Settings',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Enter your Gemini API Key...',
    saveKey: 'Save',
    keySaved: 'API Key Saved',
    keySavedSuccess: 'Your API key has been saved to your browser.',
    suggestions: 'Suggestions:',
    generating: 'Generating...',
    addKeyForSuggestions: 'Add your API key in Settings to get suggestions.',
    brush: 'Brush',
    clearSelection: 'Clear selection',
    promptPlaceholder: 'Your magic words...',
    improvePrompt: 'Improve Prompt',
    hideSuggestions: 'Hide Suggestions',
    showSuggestions: 'Show Suggestions',
    remove: 'Remove',
    apply: 'Apply',
    undo: 'Undo',
    imageLoadFailed: 'Image Load Failed',
    imageLoadError: 'The sample image could not be loaded. Please try another one or upload your own.',
    apiKeyTitle: 'Manage your Gemini API Key',
    apiKeyDescription: "This tool requires your own Google AI Gemini API key to function. Your key is stored securely in your browser and is never sent to our servers. Get your key from",
    googleAiStudio: 'Google AI Studio.',
    cancel: 'Cancel',
    setApiKeyTooltip: 'Please provide an API key in Settings to use this feature.',
    showApiKey: 'Show API Key',
    hideApiKey: 'Hide API Key',
  },
  id: {
    yourPersonalEditor: 'Editor Foto AI Pribadi Anda',
    bringYourOwnKey: 'Gunakan kunci API Gemini Anda sendiri untuk menghapus objek, orang, atau teks yang tidak diinginkan, atau berkreasilah dan ubah gambar Anda dengan perintah teks.',
    clickOrDrag: 'Klik di sini atau seret file gambar',
    tryWithExample: 'Atau coba dengan contoh',
    startNew: 'Mulai Baru',
    togglePreview: 'Lihat gambar asli',
    togglePreviewActive: 'Tampilkan versi yang diedit',
    download: 'Unduh',
    settings: 'Pengaturan',
    lightMode: 'Mode Terang',
    darkMode: 'Mode Gelap',
    language: 'Bahasa',
    apiKey: 'Kunci API',
    apiKeyPlaceholder: 'Masukkan Kunci API Gemini Anda...',
    saveKey: 'Simpan',
    keySaved: 'Kunci API Disimpan',
    keySavedSuccess: 'Kunci API Anda telah disimpan di browser Anda.',
    suggestions: 'Saran:',
    generating: 'Membuat...',
    addKeyForSuggestions: 'Tambahkan kunci API Anda di Pengaturan untuk mendapatkan saran.',
    brush: 'Kuas',
    clearSelection: 'Hapus pilihan',
    promptPlaceholder: 'Kata-kata ajaib Anda...',
    improvePrompt: 'Tingkatkan Prompt',
    hideSuggestions: 'Sembunyikan Saran',
    showSuggestions: 'Tampilkan Saran',
    remove: 'Hapus',
    apply: 'Terapkan',
    undo: 'Urungkan',
    imageLoadFailed: 'Gagal Memuat Gambar',
    imageLoadError: 'Gambar contoh tidak dapat dimuat. Silakan coba yang lain atau unggah gambar Anda sendiri.',
    apiKeyTitle: 'Kelola Kunci API Gemini Anda',
    apiKeyDescription: "Alat ini memerlukan kunci API Google AI Gemini Anda sendiri agar berfungsi. Kunci Anda disimpan dengan aman di browser Anda dan tidak pernah dikirim ke server kami. Dapatkan kunci Anda dari",
    googleAiStudio: 'Google AI Studio.',
    cancel: 'Batal',
    setApiKeyTooltip: 'Harap berikan kunci API di Pengaturan untuk menggunakan fitur ini.',
    showApiKey: 'Tampilkan Kunci API',
    hideApiKey: 'Sembunyikan Kunci API',
  },
  zh: {
    yourPersonalEditor: '您的个人 AI 照片编辑器',
    bringYourOwnKey: '使用您自己的 Gemini API 密钥来删除不需要的物体、人物或文本，或者发挥创意，用文本提示修改您的图片。',
    clickOrDrag: '点击此处或拖动图像文件',
    tryWithExample: '或尝试使用示例',
    startNew: '重新开始',
    togglePreview: '预览原图',
    togglePreviewActive: '显示编辑版本',
    download: '下载',
    settings: '设置',
    lightMode: '浅色模式',
    darkMode: '深色模式',
    language: '语言',
    apiKey: 'API 密钥',
    apiKeyPlaceholder: '输入您的 Gemini API 密钥...',
    saveKey: '保存',
    keySaved: 'API 密钥已保存',
    keySavedSuccess: '您的 API 密钥已保存到您的浏览器中。',
    suggestions: '建议:',
    generating: '生成中...',
    addKeyForSuggestions: '请在“设置”中添加您的 API 密钥以获取建议。',
    brush: '画笔',
    clearSelection: '清除选择',
    promptPlaceholder: '你的魔术词...',
    improvePrompt: '改进提示',
    hideSuggestions: '隐藏建议',
    showSuggestions: '显示建议',
    remove: '移除',
    apply: '应用',
    undo: '撤消',
    imageLoadFailed: '图片加载失败',
    imageLoadError: '无法加载示例图片。请尝试另一张或上传您自己的图片。',
    apiKeyTitle: '管理您的 Gemini API 密钥',
    apiKeyDescription: "此工具需要您自己的 Google AI Gemini API 密钥才能运行。您的密钥安全地存储在您的浏览器中，绝不会发送到我们的服务器。从",
    googleAiStudio: 'Google AI Studio 获取您的密钥。',
    cancel: '取消',
    setApiKeyTooltip: '请在“设置”中提供 API 密钥以使用此功能。',
    showApiKey: '显示 API 密钥',
    hideApiKey: '隐藏 API 密钥',
  },
};

const AiButton = ({ tooltip, disabled, children, ...props }: React.ComponentProps<typeof Button> & { tooltip: string }) => {
    const trigger = <Button disabled={disabled} {...props}>{children}</Button>;

    if (disabled) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                    <TooltipContent><p>{tooltip}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }
    return trigger;
};

export default function AetherImageEditor() {
    const { toast } = useToast();
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [brushSize, setBrushSize] = useState(40);
    const [prompt, setPrompt] = useState('');
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [resultImage, setResultImage] = useState<HTMLImageElement | null>(null);
    const [history, setHistory] = useState<(HTMLImageElement | null)[]>([]);
    const [hasMask, setHasMask] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isMouseInCanvas, setIsMouseInCanvas] = useState(false);
    const [isMouseOverImage, setIsMouseOverImage] = useState(false);
    const [imageBounds, setImageBounds] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [activeAction, setActiveAction] = useState<'remove' | 'apply' | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState<'en' | 'id' | 'zh'>('en');
    const [sampleImages, setSampleImages] = useState<{ thumbnailUrl: string; fullUrl: string; }[]>([]);
    const [apiKey, setApiKey] = useState<string>('');
    const [inputApiKey, setInputApiKey] = useState<string>('');
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
    const [imageDescription, setImageDescription] = useState<string>('');

    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const brushCursorRef = useRef<HTMLDivElement>(null);

    const isDrawing = useRef(false);
    const isInitialMount = useRef(true);
    const isApiKeySet = !!apiKey;

    // Load settings from localStorage on initial mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('genie-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme);
        }

        const savedLanguage = localStorage.getItem('genie-language');
        if (savedLanguage === 'en' || savedLanguage === 'id' || savedLanguage === 'zh') {
            setLanguage(savedLanguage as 'en' | 'id' | 'zh');
        }

        const savedApiKey = localStorage.getItem('genie-apikey');
        if (savedApiKey) {
            setApiKey(savedApiKey);
            setInputApiKey(savedApiKey);
        } else {
            // If there's no API key, open the modal on first load.
            // Timeout to prevent race conditions with initial render.
            setTimeout(() => setIsApiKeyModalOpen(true), 100);
        }
    }, []);

    useEffect(() => {
        const newImages = Array.from({ length: 5 }, (_, i) => {
            // Using a random seed for each sample image on every refresh
            const seed = `${Math.random()}-${i}`;
            return {
                thumbnailUrl: `https://picsum.photos/seed/${seed}/200/200`,
                fullUrl: `https://picsum.photos/seed/${seed}/1920/1080`,
            };
        });
        setSampleImages(newImages);
    }, []);

    // Apply theme to the document and save to localStorage on change
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('genie-theme', theme);
    }, [theme]);
    
    // Handle language changes: save to localStorage and regenerate prompts
    useEffect(() => {
        localStorage.setItem('genie-language', language);
    
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
    
        if (image && apiKey) {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(image, 0, 0);
            const dataUri = canvas.toDataURL('image/jpeg');
            
            setIsSuggesting(true);
            generateInitialPrompt({ photoDataUri: dataUri, language: language, apiKey })
                .then(res => setSuggestedPrompts(res.prompts))
                .catch(err => console.error("Could not generate suggestions:", err))
                .finally(() => setIsSuggesting(false));
        }
    }, [language, image, apiKey]);


    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleSaveApiKey = () => {
        setApiKey(inputApiKey);
        localStorage.setItem('genie-apikey', inputApiKey);
        toast({
            title: translations[language].keySaved,
            description: translations[language].keySavedSuccess,
        });
        setIsApiKeyModalOpen(false);

        // If an image is already loaded, generate prompts now that we have a key
        if(image) {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(image, 0, 0);
            const dataUri = canvas.toDataURL('image/jpeg');
            
            setIsSuggesting(true);
            generateInitialPrompt({ photoDataUri: dataUri, language: language, apiKey: inputApiKey })
                .then(res => setSuggestedPrompts(res.prompts))
                .catch(err => console.error("Could not generate suggestions:", err))
                .finally(() => setIsSuggesting(false));
        }
    };

    const getCanvasContext = (canvasRef: React.RefObject<HTMLCanvasElement>) => canvasRef.current?.getContext('2d');
    
    const resizeAndDrawImage = useCallback(() => {
        const mainCtx = getCanvasContext(mainCanvasRef);
        const maskCtx = getCanvasContext(maskCanvasRef);
        const container = containerRef.current;
        const mainCanvas = mainCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        
        if (!container || !mainCanvas || !maskCanvas) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        
        mainCanvas.width = rect.width * dpr;
        mainCanvas.height = rect.height * dpr;
        maskCanvas.width = mainCanvas.width;
        maskCanvas.height = mainCanvas.height;

        mainCtx?.scale(dpr, dpr);
        maskCtx?.scale(dpr, dpr);

        mainCanvas.style.width = `${rect.width}px`;
        mainCanvas.style.height = `${rect.height}px`;
        maskCanvas.style.width = mainCanvas.style.width;
        maskCanvas.style.height = mainCanvas.style.height;

        const currentImage = isPreviewing ? image : (resultImage || image);
        if (currentImage && mainCtx) {
            const hRatio = rect.width / currentImage.naturalWidth;
            const vRatio = rect.height / currentImage.naturalHeight;
            const ratio = Math.min(hRatio, vRatio, 1);
            const centerShift_x = (rect.width - currentImage.naturalWidth * ratio) / 2;
            const centerShift_y = (rect.height - currentImage.naturalHeight * ratio) / 2;
            const newWidth = currentImage.naturalWidth * ratio;
            const newHeight = currentImage.naturalHeight * ratio;
            
            setImageBounds({ x: centerShift_x, y: centerShift_y, width: newWidth, height: newHeight });

            mainCtx.clearRect(0, 0, rect.width, rect.height);
            mainCtx.drawImage(currentImage, 0, 0, currentImage.naturalWidth, currentImage.naturalHeight, centerShift_x, centerShift_y, newWidth, newHeight);
        } else {
            if (mainCtx) {
                mainCtx.clearRect(0, 0, rect.width, rect.height);
            }
            setImageBounds(null);
        }
    }, [image, resultImage, isPreviewing]);

    useEffect(() => {
        const container = containerRef.current;
        const observer = new ResizeObserver(resizeAndDrawImage);
        if (container) observer.observe(container);
        return () => {
            if (container) observer.unobserve(container);
        };
    }, [resizeAndDrawImage]);

    useEffect(() => {
        resizeAndDrawImage();
    }, [resizeAndDrawImage]);

    const handleImageChange = (img: HTMLImageElement) => {
        setImage(img);
        setResultImage(null);
        setHistory([]);
        clearMask();
        setSuggestedPrompts([]);
        setPrompt('');
        setImageDescription('');
        setIsPreviewing(false);


        if (!apiKey) {
            // We already check for this and open modal on mount, but this is a fallback.
            setIsApiKeyModalOpen(true);
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataUri = canvas.toDataURL('image/jpeg');
        
        setIsSuggesting(true);
        generateInitialPrompt({ photoDataUri: dataUri, language: language, apiKey })
            .then(res => setSuggestedPrompts(res.prompts))
            .catch(err => console.error("Could not generate suggestions:", err))
            .finally(() => setIsSuggesting(false));

        describeImage({ photoDataUri: dataUri, apiKey })
            .then(res => setImageDescription(res.description))
            .catch(err => console.error("Could not describe image:", err));
    }
    
    const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new window.Image();
                img.onload = () => handleImageChange(img);
                img.onerror = () => console.error("Invalid image file");
                img.src = event.target.result as string;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

     const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) {
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new window.Image();
                img.onload = () => handleImageChange(img);
                img.onerror = () => console.error("Invalid image file");
                img.src = event.target.result as string;
            };
            reader.readAsDataURL(file);
        }
    }
    
    const useSampleImage = (url: string) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => handleImageChange(img);
        img.onerror = () => {
            console.error("Could not load sample image");
            toast({
                variant: 'destructive',
                title: translations[language].imageLoadFailed,
                description: translations[language].imageLoadError,
            });
        };
        img.src = url;
    }

    const preflightApiKeyCheck = () => {
        if (!apiKey) {
            setIsApiKeyModalOpen(true);
            return false;
        }
        return true;
    }
    
    const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top,
        };
    };

    const getTouchPos = (canvas: HTMLCanvasElement, evt: React.TouchEvent) => {
        if (!evt.touches || evt.touches.length === 0) return null;
        const rect = canvas.getBoundingClientRect();
        const touch = evt.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
    };


    const checkMaskContent = useCallback(() => {
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) {
            setHasMask(false);
            return;
        }
        const ctx = maskCanvas.getContext('2d');
        if (!ctx) {
            setHasMask(false);
            return;
        }
        const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {
                setHasMask(true);
                return;
            }
        }
        setHasMask(false);
    }, []);

    const startDrawing = (pos: { x: number, y: number } | null) => {
        if (!image || !pos) return;
        isDrawing.current = true;
        
        const maskCtx = getCanvasContext(maskCanvasRef);
        if (!maskCtx) return;

        maskCtx.beginPath();
        maskCtx.moveTo(pos.x, pos.y);
        drawAtPoint(pos);
    }

    const startDrawingMouse = (e: React.MouseEvent) => {
        if (!isMouseOverImage) return;
        const pos = getMousePos(maskCanvasRef.current!, e);
        startDrawing(pos);
    };

    const stopDrawing = () => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        const maskCtx = getCanvasContext(maskCanvasRef);
        maskCtx?.beginPath();
        checkMaskContent();
    };

    const drawAtPoint = (pos: { x: number, y: number } | null) => {
        if (!pos) return;
        const maskCtx = getCanvasContext(maskCanvasRef);
        if (!maskCtx) return;

        maskCtx.lineWidth = brushSize;
        maskCtx.lineCap = 'round';
        maskCtx.lineJoin = 'round';

        const primaryColorHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        maskCtx.strokeStyle = `hsla(${primaryColorHsl} / 0.7)`;

        maskCtx.lineTo(pos.x, pos.y);
        maskCtx.stroke();
    }

    const drawMouse = (e: React.MouseEvent) => {
        if (!isDrawing.current || !isMouseOverImage) return;
        const pos = getMousePos(maskCanvasRef.current!, e);
        drawAtPoint(pos);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!image) return;
        e.preventDefault(); // Prevents scrolling
        const pos = getTouchPos(maskCanvasRef.current!, e);
        if (pos) {
            const { x, y } = pos;
            if (imageBounds && x >= imageBounds.x && x <= imageBounds.x + imageBounds.width &&
                y >= imageBounds.y && y <= imageBounds.y + imageBounds.height) {
                startDrawing(pos);
            }
        }
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDrawing.current) return;
        e.preventDefault(); // Prevents scrolling
        const pos = getTouchPos(maskCanvasRef.current!, e);
        drawAtPoint(pos);
    };

    const handleTouchEnd = () => {
        stopDrawing();
    };
    
    const updateBrushCursor = (e: React.MouseEvent) => {
        const brushCursor = brushCursorRef.current;
        const container = containerRef.current;
        if (brushCursor && container) {
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            brushCursor.style.left = `${mouseX - brushSize / 2}px`;
            brushCursor.style.top = `${mouseY - brushSize / 2}px`;
            
            if (imageBounds) {
                const isOver = mouseX >= imageBounds.x && mouseX <= imageBounds.x + imageBounds.width &&
                               mouseY >= imageBounds.y && mouseY <= imageBounds.y + imageBounds.height;
                setIsMouseOverImage(isOver);
            } else {
                setIsMouseOverImage(false);
            }
        }
    }

    const clearMask = () => {
        const maskCtx = getCanvasContext(maskCanvasRef);
        if (maskCtx && maskCanvasRef.current) {
            maskCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
        }
        setHasMask(false);
    };
    
    const handleImprovePrompt = async () => {
        if (!prompt || !preflightApiKeyCheck()) {
            return;
        }
        setIsImproving(true);
        try {
            const result = await improvePromptClarity({ prompt, imageDescription, apiKey });
            setPrompt(result.improvedPrompt);
        } catch (error) {
            console.error("Could not improve prompt:", error);
            const err = error as Error;
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: err.message || 'Failed to improve prompt.',
            });
        } finally {
            setIsImproving(false);
        }
    }

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = src;
        });
    }

    const handleApply = async (promptOverride?: string) => {
        if (!image || !preflightApiKeyCheck()) return;
        const finalPrompt = promptOverride || prompt;
        if (!finalPrompt && promptOverride !== '__REMOVE_OBJECT__') {
            return;
        }

        setIsLoading(true);
        setActiveAction(finalPrompt === "__REMOVE_OBJECT__" ? 'remove' : 'apply');
        const currentStateForHistory = resultImage;
        
        try {
            const sourceImage = resultImage || image;
            const imageCanvas = document.createElement('canvas');
            imageCanvas.width = sourceImage.naturalWidth;
            imageCanvas.height = sourceImage.naturalHeight;
            const imageCtx = imageCanvas.getContext('2d');
            if (!imageCtx) throw new Error("Couldn't get image context");
            imageCtx.drawImage(sourceImage, 0, 0);
            const photoDataUri = imageCanvas.toDataURL('image/png');

            const maskCanvas = maskCanvasRef.current;
            if (!maskCanvas) throw new Error("Mask canvas not found");
            
            const finalMaskCanvas = document.createElement('canvas');
            finalMaskCanvas.width = sourceImage.naturalWidth;
            finalMaskCanvas.height = sourceImage.naturalHeight;
            const finalMaskCtx = finalMaskCanvas.getContext('2d');
            if (!finalMaskCtx) throw new Error("Could not create final mask context");
            
            finalMaskCtx.clearRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
            
            if (imageBounds) {
                const dpr = window.devicePixelRatio || 1;
                finalMaskCtx.drawImage(
                    maskCanvas,
                    imageBounds.x * dpr, 
                    imageBounds.y * dpr, 
                    imageBounds.width * dpr,
                    imageBounds.height * dpr,
                    0, 
                    0, 
                    sourceImage.naturalWidth,
                    sourceImage.naturalHeight
                );
            }
            
            const imageData = finalMaskCtx.getImageData(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
            const data = imageData.data;
            let hasDrawnMask = false;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0) {
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;
                    data[i + 3] = 255;
                    hasDrawnMask = true;
                } else {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                    data[i + 3] = 255;
                }
            }
            finalMaskCtx.putImageData(imageData, 0, 0);

            const isRemoveObjectAction = finalPrompt === "__REMOVE_OBJECT__";

            if (!hasDrawnMask) {
                if (isRemoveObjectAction) {
                    setIsLoading(false);
                    setActiveAction(null);
                    return; 
                }
                // If there's no mask for a prompt-based edit, we assume a full-image edit
                finalMaskCtx.fillStyle = 'white';
                finalMaskCtx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
            }

            const maskDataUri = finalMaskCanvas.toDataURL('image/png');
            
            const result = await editImage({
                photoDataUri,
                maskDataUri,
                prompt: finalPrompt,
                apiKey,
            });

            const newImage = await loadImage(result.editedPhotoDataUri);
            setHistory(prev => [...prev, currentStateForHistory]);
            setResultImage(newImage);
            clearMask();
            setIsPreviewing(false);

        } catch (error) {
            console.error("Error applying edit:", error);
            const err = error as Error;
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: err.message || 'Failed to apply the edit. Please try again.',
            });
        } finally {
            setIsLoading(false);
            setActiveAction(null);
        }
    };
    
    const handleUndo = () => {
        if (history.length === 0) return;

        const lastImageState = history[history.length - 1];
        setResultImage(lastImageState);
        setHistory(history.slice(0, -1));
        setIsPreviewing(false);
    };

    const handleDownload = () => {
        const canvas = mainCanvasRef.current;
        if (!canvas || (!image && !resultImage)) {
            return;
        }
        const link = document.createElement('a');
        link.download = `genie_edit_${Date.now()}.png`;
        
        const downloadCanvas = document.createElement('canvas');
        const sourceImage = resultImage || image;
        if (!sourceImage) return;

        downloadCanvas.width = sourceImage.naturalWidth;
        downloadCanvas.height = sourceImage.naturalHeight;
        
        const ctx = downloadCanvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(sourceImage, 0, 0);

        link.href = downloadCanvas.toDataURL('image/png');
        link.click();
    };

    const resetState = () => {
        setImage(null);
        setResultImage(null);
        setPrompt('');
        setSuggestedPrompts([]);
        setHistory([]);
        clearMask();
        setImageBounds(null);
        setImageDescription('');
        setIsPreviewing(false);
    }

    const aiDisabled = !isApiKeySet;

    if (!image) {
        return (
            <div className="h-screen w-screen bg-background text-foreground flex flex-col">
                <header className="p-4 flex items-center justify-between">
                    <Logo />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0">
                                <Settings />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{translations[language].settings}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={toggleTheme}>
                                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                <span>{theme === 'light' ? translations[language].darkMode : translations[language].lightMode}</span>
                            </DropdownMenuItem>
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Languages className="h-4 w-4" />
                                    <span>{translations[language].language}</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setLanguage('id')}>Bahasa</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setLanguage('zh')}>中文</DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsApiKeyModalOpen(true)}>
                                <KeyRound className="h-4 w-4" />
                                <span>{translations[language].apiKey}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-4xl mx-auto">
                        {translations[language].yourPersonalEditor}
                    </h1>
                     <p className="text-muted-foreground mt-4 max-w-xl">
                        {translations[language].bringYourOwnKey}
                    </p>
                    
                    <div
                        className="group mt-8 w-full max-w-lg mx-auto border-2 border-dashed border-muted-foreground/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:border-primary/80 hover:bg-primary/20 transition-colors"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                    >
                         <Upload className="h-12 w-12 text-foreground/80 group-hover:text-primary" />
                        <p className="mt-4 text-foreground/80 group-hover:text-primary">{translations[language].clickOrDrag}</p>
                        <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={onImageUpload} />
                    </div>

                    <div className="mt-8">
                        <p className="text-muted-foreground">{translations[language].tryWithExample}</p>
                        <div className="mt-4 flex justify-center flex-wrap gap-4">
                            {sampleImages.map((sample, i) => (
                                <div key={i} className="rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all">
                                    <NextImage
                                        src={sample.thumbnailUrl}
                                        width={96}
                                        height={96}
                                        alt={`Sample ${i + 1}`}
                                        className="w-24 h-24 object-cover cursor-pointer hover:opacity-90"
                                        onClick={() => useSampleImage(sample.fullUrl)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
                 <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{translations[language].apiKeyTitle}</DialogTitle>
                            <DialogDescription>
                                {translations[language].apiKeyDescription}{' '}
                                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                                    {translations[language].googleAiStudio}
                                </a>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-2">
                            <Label htmlFor="api-key-modal-input">{translations[language].apiKey}</Label>
                            <div className="relative flex items-center">
                                <Input
                                    id="api-key-modal-input"
                                    type={isApiKeyVisible ? 'text' : 'password'}
                                    placeholder={translations[language].apiKeyPlaceholder}
                                    value={inputApiKey}
                                    onChange={(e) => setInputApiKey(e.target.value)}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 h-7 w-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => setIsApiKeyVisible(prev => !prev)}
                                    aria-label={isApiKeyVisible ? translations[language].hideApiKey : translations[language].showApiKey}
                                >
                                    {isApiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsApiKeyModalOpen(false)} variant="outline" className="hover:bg-transparent hover:text-foreground">{translations[language].cancel}</Button>
                            <Button onClick={handleSaveApiKey} disabled={!inputApiKey || !inputApiKey.startsWith('AIzaSy')}>
                                <Save className="h-4 w-4" />
                                {translations[language].saveKey}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
    
    return (
        <>
            <div className="h-screen w-screen bg-muted/40 text-foreground flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-3 shrink-0">
                    <Button variant="ghost" onClick={resetState}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden md:inline ml-2">{translations[language].startNew}</span>
                    </Button>
                    <div className="flex items-center gap-4">
                        {resultImage && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-muted-foreground" />
                                            <Switch
                                                checked={isPreviewing}
                                                onCheckedChange={setIsPreviewing}
                                                disabled={isLoading}
                                                aria-label={translations[language].togglePreview}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isPreviewing ? translations[language].togglePreviewActive : translations[language].togglePreview}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        <TooltipProvider>
                            <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full"
                                            onClick={handleUndo}
                                            disabled={history.length === 0 || isLoading}
                                        >
                                            <Undo2 />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{translations[language].undo}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                        <Button onClick={handleDownload} disabled={!resultImage && !image || isLoading} className="rounded-full">
                            <Download /> {translations[language].download}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0">
                                    <Settings />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{translations[language].settings}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={toggleTheme}>
                                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                    <span>{theme === 'light' ? translations[language].darkMode : translations[language].lightMode}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Languages className="h-4 w-4" />
                                        <span>{translations[language].language}</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setLanguage('id')}>Bahasa</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setLanguage('zh')}>中文</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setIsApiKeyModalOpen(true)}>
                                    <KeyRound className="h-4 w-4" />
                                    <span>{translations[language].apiKey}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                
                <main ref={containerRef} className="flex-1 relative flex items-center justify-center overflow-hidden"
                    onMouseMove={updateBrushCursor}
                    onMouseLeave={() => { setIsMouseInCanvas(false); setIsMouseOverImage(false); }}
                    onMouseEnter={() => setIsMouseInCanvas(true)}
                >
                    <div 
                        ref={brushCursorRef}
                        className="absolute rounded-full border border-primary bg-primary/20 pointer-events-none z-30"
                        style={{
                            width: brushSize,
                            height: brushSize,
                            display: isPreviewing || !isMouseInCanvas || !isMouseOverImage ? 'none' : 'block',
                        }}
                    />
                    <canvas ref={mainCanvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full z-10" />
                    <canvas
                        ref={maskCanvasRef}
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full z-20",
                            (isMouseOverImage && !isPreviewing) ? 'cursor-none' : 'cursor-default'
                        )}
                        onMouseDown={startDrawingMouse}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onMouseMove={drawMouse}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />
                </main>

                <footer className="flex flex-col items-center gap-2 p-4 shrink-0">
                    {(isApiKeySet || suggestedPrompts.length > 0) && showSuggestions && (
                        <Card className="max-w-4xl w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 shadow-lg">
                            <CardContent className="p-3">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                    <Label className="text-xs text-muted-foreground shrink-0">{translations[language].suggestions}</Label>
                                    {!isApiKeySet ? (
                                        <div className="text-sm text-muted-foreground">{translations[language].addKeyForSuggestions}</div>
                                    ) : isSuggesting ? (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>{translations[language].generating}</span>
                                        </div>
                                    ) : (
                                        <>
                                            {suggestedPrompts.map((p, i) => (
                                                <Button key={i} variant="outline" size="sm" onClick={() => setPrompt(p)}>{p}</Button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="w-full max-w-4xl shadow-lg">
                        <CardContent className="p-2">
                            <TooltipProvider>
                                <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
                                    <div className="flex items-center gap-2 md:shrink-0">
                                        <div className="flex flex-1 items-center gap-2 rounded-md bg-muted p-2 md:w-48">
                                            <Brush />
                                            <div className="flex-1">
                                                <Slider
                                                    value={[brushSize]}
                                                    onValueChange={(v) => setBrushSize(v[0])}
                                                    max={100}
                                                    step={1}
                                                />
                                            </div>
                                        </div>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={clearMask} disabled={!hasMask || isLoading}>
                                                    <Eraser />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{translations[language].clearSelection}</p></TooltipContent>
                                        </Tooltip>
                                    </div>
                                    
                                    <Separator className="hidden md:block h-10 mx-1" orientation="vertical" />
                                    <Separator className="block md:hidden" orientation="horizontal" />

                                    <div className="flex flex-1 items-center gap-2 min-w-0">
                                        <Input
                                            id="prompt"
                                            placeholder={translations[language].promptPlaceholder}
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            disabled={isLoading}
                                            className="flex-1"
                                        />
                                        <AiButton
                                            onClick={handleImprovePrompt}
                                            variant="ghost"
                                            size="icon"
                                            disabled={aiDisabled || isImproving || !prompt || isLoading}
                                            tooltip={translations[language].setApiKeyTooltip}
                                            className="shrink-0"
                                        >
                                            {isImproving ? <Loader2 className="animate-spin" /> : <Wand2 />}
                                        </AiButton>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    onClick={() => setShowSuggestions(s => !s)} 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    disabled={(aiDisabled && suggestedPrompts.length === 0) || isLoading}
                                                    className="shrink-0"
                                                >
                                                    {showSuggestions ? <LightbulbOff /> : <Lightbulb />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{showSuggestions ? translations[language].hideSuggestions : translations[language].showSuggestions}</p></TooltipContent>
                                        </Tooltip>
                                    </div>

                                    <Separator className="hidden md:block h-10 mx-1" orientation="vertical" />
                                    <Separator className="block md:hidden" orientation="horizontal" />
                                    
                                    <div className="flex shrink-0 items-center gap-2">
                                        <AiButton 
                                            variant="destructive"
                                            onClick={() => handleApply("__REMOVE_OBJECT__")}
                                            disabled={aiDisabled || isLoading || !hasMask}
                                            tooltip={translations[language].setApiKeyTooltip}
                                        >
                                            {isLoading && activeAction === 'remove' ? <Loader2 className="animate-spin" /> : <Trash2 />}
                                            {translations[language].remove}
                                        </AiButton>
                                        <AiButton 
                                            onClick={() => handleApply()}
                                            disabled={aiDisabled || isLoading || !prompt}
                                            tooltip={translations[language].setApiKeyTooltip}
                                        >
                                            {isLoading && activeAction === 'apply' ? <Loader2 className="animate-spin" /> : <Wand2 />}
                                            {translations[language].apply}
                                        </AiButton>
                                    </div>
                                </div>
                            </TooltipProvider>
                        </CardContent>
                    </Card>
                </footer>
            </div>
            <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{translations[language].apiKeyTitle}</DialogTitle>
                        <DialogDescription>
                            {translations[language].apiKeyDescription}{' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                                {translations[language].googleAiStudio}
                            </a>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="api-key-modal-input">{translations[language].apiKey}</Label>
                        <div className="relative flex items-center">
                            <Input
                                id="api-key-modal-input"
                                type={isApiKeyVisible ? 'text' : 'password'}
                                placeholder={translations[language].apiKeyPlaceholder}
                                value={inputApiKey}
                                onChange={(e) => setInputApiKey(e.target.value)}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 h-7 w-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => setIsApiKeyVisible(prev => !prev)}
                                aria-label={isApiKeyVisible ? translations[language].hideApiKey : translations[language].showApiKey}
                            >
                                {isApiKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                         <Button onClick={() => setIsApiKeyModalOpen(false)} variant="outline" className="hover:bg-transparent hover:text-foreground">{translations[language].cancel}</Button>
                        <Button onClick={handleSaveApiKey} disabled={!inputApiKey || !inputApiKey.startsWith('AIzaSy')}>
                            <Save className="h-4 w-4" />
                            {translations[language].saveKey}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
