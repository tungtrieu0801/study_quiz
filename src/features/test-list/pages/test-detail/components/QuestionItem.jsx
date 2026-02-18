import React from "react";
import {Image, Input} from "antd";
import {
    CheckOutlined,
    CloseOutlined,
    CheckSquareOutlined,
    FlagOutlined,
    WarningOutlined,
    CheckCircleFilled,
    CloseCircleFilled
} from "@ant-design/icons";
import { motion } from "framer-motion";

const {TextArea} = Input;

// --- 1. SUPER CLEAN TRUE/FALSE RENDERER ---
// --- 1. COMPACT TRUE/FALSE RENDERER ---
const RenderTrueFalse = ({q, userAnswer, resultData, isReviewing, onChange}) => {
    const currentVal = String(userAnswer);

    const options = [
        {
            label: "Đúng",
            val: "true",
            icon: <CheckOutlined/>,
            // Style cơ bản (Chưa chọn)
            baseClass: "bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600",
            // Style khi ĐÃ chọn (Active)
            activeClass: "bg-green-50 border-green-500 text-green-700 font-bold shadow-sm",
            // Review: Đáp án đúng
            correctClass: "bg-green-100 border-green-600 text-green-800 font-bold",
            // Review: Chọn sai
            wrongClass: "bg-red-50 border-red-300 text-red-500 opacity-60 decoration-line-through"
        },
        {
            label: "Sai",
            val: "false",
            icon: <CloseOutlined/>,
            baseClass: "bg-white border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-600",
            activeClass: "bg-green-50 border-green-500 text-green-700 font-bold shadow-sm",
            correctClass: "bg-green-100 border-green-600 text-green-800 font-bold",
            wrongClass: "bg-red-50 border-red-300 text-red-500 opacity-60 decoration-line-through"
        }
    ];

    return (
        <div className="flex gap-3 mt-3 max-w-md">
            {/* Image */}
            {q.imageUrl && (
                <div className="mb-4">
                    <Image
                        src={q.imageUrl}
                        height={300}
                        className="rounded-lg"
                    />
                </div>
            )}
            {/* max-w-md để giới hạn chiều rộng, không cho nó giãn hết màn hình */}
            {options.map((opt) => {
                const isSelected = currentVal === opt.val;
                let btnClass = opt.baseClass;
                let showCheck = false;

                // LOGIC XỬ LÝ STYLE
                if (!isReviewing) {
                    if (isSelected) btnClass = opt.activeClass;
                } else if (resultData) {
                    const correctVal = String(resultData.correctAnswer);
                    if (opt.val === correctVal) {
                        btnClass = opt.correctClass;
                        showCheck = true; // Hiện icon check nhỏ báo đáp án đúng
                    } else if (isSelected && opt.val !== correctVal) {
                        btnClass = opt.wrongClass;
                    } else {
                        btnClass = "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed";
                    }
                }

                return (
                    <motion.button
                        key={opt.val}
                        whileTap={!isReviewing ? {scale: 0.97} : {}}
                        onClick={() => !isReviewing && onChange(q._id, opt.val, 'TRUE_FALSE')}
                        className={`
                            relative flex-1 py-2 px-4 rounded-lg border transition-all duration-200 
                            flex items-center justify-center gap-2 text-sm md:text-base
                            ${btnClass}
                        `}
                        disabled={isReviewing}
                    >
                        {/* Icon và Label nằm ngang */}
                        <span className="text-lg">{opt.icon}</span>
                        <span>{opt.label}</span>

                        {/* Icon trạng thái khi Review */}
                        {showCheck && isReviewing && (
                            <div
                                className="absolute -top-2 -right-2 bg-white text-green-600 rounded-full border border-green-200 shadow-sm p-0.5">
                                <CheckCircleFilled/>
                            </div>
                        )}
                    </motion.button>
                )
            })}
        </div>
    );
};

// --- 2. ULTRA SEAMLESS FILL IN BLANK (Dạng văn bản liền mạch) ---
const RenderFillInBlank = ({q, userAnswer, resultData, isReviewing, onChange}) => {
    const parts = q.content.split('___');
    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
    const correctAnswers = resultData && Array.isArray(resultData.correctAnswer) ? resultData.correctAnswer : [];

    // Tính toán độ rộng input dựa trên nội dung
    const getInputWidth = (val) => {
        const textLength = val ? val.length : 0;
        // Min 60px, mỗi ký tự thêm 10px, max 200px
        return Math.max(60, Math.min(200, textLength * 12 + 20));
    };

    return (
        <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-lg md:text-xl leading-[2.5] text-slate-700 font-medium">
                {/* Image */}
                {q.imageUrl && (
                    <div className="mb-4">
                        <Image
                            src={q.imageUrl}
                            height={300}
                            className="rounded-lg"
                        />
                    </div>
                )}
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {/* Phần text tĩnh */}
                        <span>{part}</span>

                        {/* Input điền từ */}
                        {index < parts.length - 1 && (
                            <span className="inline-block mx-1 align-baseline relative group">
                                {isReviewing ? (
                                    // --- CHẾ ĐỘ REVIEW (Hiển thị kết quả) ---
                                    <span className="inline-flex flex-col items-center align-middle mx-1">
                                        <span className={`
                                            px-2 border-b-2 font-bold transition-colors
                                            ${userAnswers[index]?.trim().toLowerCase() === String(correctAnswers[index])?.trim().toLowerCase()
                                            ? 'text-green-700 border-green-600 bg-green-50'
                                            : 'text-red-600 border-red-500 bg-red-50 decoration-red-500 line-through'}
                                        `}>
                                            {userAnswers[index] || "(Trống)"}
                                        </span>
                                        {/* Hiện đáp án đúng nếu sai */}
                                        {userAnswers[index]?.trim().toLowerCase() !== String(correctAnswers[index])?.trim().toLowerCase() && (
                                            <span
                                                className="absolute -bottom-6 left-0 whitespace-nowrap text-xs text-white bg-green-600 px-1.5 py-0.5 rounded shadow-sm z-10">
                                                {correctAnswers[index]}
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    // --- CHẾ ĐỘ LÀM BÀI (Input tàng hình) ---
                                    <>
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            value={userAnswers[index] || ""}
                                            onChange={(e) => onChange(q._id, {
                                                index: index,
                                                text: e.target.value
                                            }, 'FILL_IN_THE_BLANK')}
                                            style={{width: `${getInputWidth(userAnswers[index])}px`}}
                                            className="
                                                text-center font-bold text-blue-700 bg-transparent
                                                border-b-2 border-slate-300 rounded-none
                                                focus:border-blue-600 focus:bg-blue-50/30 focus:outline-none
                                                transition-all duration-200
                                                px-1 py-0 h-8
                                                placeholder:text-slate-300 placeholder:font-normal placeholder:text-sm
                                            "
                                        />
                                        {/* Số thứ tự nhỏ mờ bên dưới input để biết điền ô nào */}
                                        <span
                                            className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-300 select-none">
                                            ({index + 1})
                                        </span>
                                    </>
                                )}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

// --- GIỮ NGUYÊN CÁC RENDERER KHÁC (Single, Multiple, Short) ---
const RenderSingleChoice = ({q, userAnswer, resultData, isReviewing, onChange}) => (
    <div className="grid gap-3 ml-0 md:ml-0">
        <div className="text-lg text-red-400 italic mb-1 font-bold">* Chọn đáp án đúng duy nhất</div>
        {/* Image */}
        {q.imageUrl && (
            <div className="mb-4">
                <Image
                    src={q.imageUrl}
                    height={300}
                    className="rounded-lg"
                />
            </div>
        )}
        {q.options.map((opt) => {
            const isSelected = userAnswer === opt;
            let containerClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
            let iconRender = null;
            if (!isReviewing) {
                if (isSelected) containerClass = "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm";
            } else if (resultData) {
                if (opt === resultData.correctAnswer) {
                    containerClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                    iconRender = <CheckCircleFilled className="text-green-600 text-xl ml-auto"/>;
                } else if (isSelected) {
                    containerClass = "border-red-400 bg-red-50 ring-1 ring-red-400 opacity-80";
                    iconRender = <CloseCircleFilled className="text-red-500 text-xl ml-auto"/>;
                } else {
                    containerClass = "border-slate-100 opacity-50";
                }
            }
            return (
                <div key={opt} onClick={() => onChange(q._id, opt, 'SINGLE_CHOICE')}
                     className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${containerClass}`}>
                    <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-600' : 'border-slate-300'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"/>}
                    </div>
                    <span
                        className={`text-sm md:text-base font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt}</span>
                    {iconRender}
                </div>
            );
        })}
    </div>
);

const RenderMultipleSelect = ({q, userAnswer, resultData, isReviewing, onChange}) => {
    const currentSelected = Array.isArray(userAnswer) ? userAnswer : [];
    return (
        <div className="grid gap-3">
            <div className="text-lg text-red-400 italic mb-1 font-bold">* Chọn tất cả các đáp án đúng</div>
            {/* Image */}
            {q.imageUrl && (
                <div className="mb-4">
                    <Image
                        src={q.imageUrl}
                        height={300}
                        className="rounded-lg"
                    />
                </div>
            )}
            {q.options.map((opt) => {
                const isSelected = currentSelected.includes(opt);
                let containerClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                let iconRender = null;
                if (!isReviewing) {
                    if (isSelected) containerClass = "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm";
                } else if (resultData) {
                    const correctArr = Array.isArray(resultData.correctAnswer) ? resultData.correctAnswer : [];
                    if (correctArr.includes(opt)) {
                        if (isSelected) {
                            containerClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                            iconRender = <CheckCircleFilled className="text-green-600 text-xl ml-auto"/>;
                        } else {
                            containerClass = "border-green-500 border-dashed bg-white opacity-70";
                            iconRender =
                                <span className="ml-auto text-green-600 text-xs font-bold">(Đáp án đúng)</span>;
                        }
                    } else if (isSelected) {
                        containerClass = "border-red-400 bg-red-50 ring-1 ring-red-400";
                        iconRender = <CloseCircleFilled className="text-red-500 text-xl ml-auto"/>;
                    } else {
                        containerClass = "border-slate-100 opacity-40";
                    }
                }
                return (
                    <div key={opt} onClick={() => onChange(q._id, opt, 'MULTIPLE_SELECT')}
                         className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${containerClass}`}>
                        <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                            {isSelected && <CheckSquareOutlined className="text-white text-xs"/>}
                        </div>
                        <span
                            className={`text-sm md:text-base font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{opt}</span>
                        {iconRender}
                    </div>
                );
            })}
        </div>
    );
};

const RenderShortAnswer = ({q, userAnswer, resultData, isReviewing, onChange}) => (
    <div className="w-full">
        {/* Image */}
        {q.imageUrl && (
            <div className="mb-4">
                <Image
                    src={q.imageUrl}
                    height={300}
                    className="rounded-lg"
                />
            </div>
        )}
        {isReviewing ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="mb-2">
                    <span className="text-slate-500 text-sm">Câu trả lời của bạn:</span>
                    <div
                        className={`mt-1 font-medium text-lg ${resultData?.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{userAnswer || "(Bỏ trống)"}</div>
                </div>
                {!resultData?.isCorrect && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                        <span className="text-slate-500 text-sm">Đáp án tham khảo:</span>
                        <div
                            className="mt-1 font-medium text-lg text-green-700">{Array.isArray(resultData?.correctAnswer) ? resultData.correctAnswer.join(" / ") : resultData?.correctAnswer}</div>
                    </div>
                )}
            </div>
        ) : (
            <TextArea rows={3} placeholder="Nhập câu trả lời..." value={userAnswer || ""}
                      onChange={(e) => onChange(q._id, e.target.value, 'SHORT_ANSWER')}
                      className="rounded-xl border-slate-300 text-base focus:border-blue-500 focus:shadow-sm"/>
        )}
    </div>
);

// --- MAIN COMPONENT ---
const QuestionItem = React.forwardRef(({q, index, userAnswer, resultData, isReviewing, onChange}, ref) => {
    const renderInput = () => {
        switch (q.type) {
            case 'MULTIPLE_SELECT':
                return <RenderMultipleSelect q={q} userAnswer={userAnswer} resultData={resultData}
                                             isReviewing={isReviewing} onChange={onChange}/>;
            case 'TRUE_FALSE':
                return <RenderTrueFalse q={q} userAnswer={userAnswer} resultData={resultData} isReviewing={isReviewing}
                                        onChange={onChange}/>;
            case 'FILL_IN_THE_BLANK':
                return <RenderFillInBlank q={q} userAnswer={userAnswer} resultData={resultData}
                                          isReviewing={isReviewing} onChange={onChange}/>;
            case 'SHORT_ANSWER':
                return <RenderShortAnswer q={q} userAnswer={userAnswer} resultData={resultData}
                                          isReviewing={isReviewing} onChange={onChange}/>;
            default:
                return <RenderSingleChoice q={q} userAnswer={userAnswer} resultData={resultData}
                                           isReviewing={isReviewing} onChange={onChange}/>;
        }
    };

    return (
        <div ref={ref}
             className={`p-5 md:p-8 rounded-2xl bg-white shadow-sm border transition-all scroll-mt-48 ${isReviewing ? (resultData?.isCorrect ? 'border-green-200 bg-green-50/20' : 'border-red-200 bg-red-50/20') : 'border-slate-200 hover:shadow-md'}`}>
            <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full
                        flex items-center justify-center
                        bg-blue-100 text-blue-600 font-bold">
                        {index + 1}
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-semibold leading-relaxed">
                        {q.content}
                    </h3>
                </div>
            </div>

            <div className="ml-0 md:ml-14">{renderInput()}</div>

            {isReviewing && (
                <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}}
                            className="mt-6 ml-0 md:ml-14 p-4 bg-amber-50 rounded-xl border border-amber-200 text-slate-700 text-sm md:text-base">
                    <div className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        {!resultData ? <WarningOutlined className="text-red-500"/> : <FlagOutlined/>}
                        {resultData ? "Giải thích chi tiết:" :
                            <span className="text-red-600">Bạn chưa làm câu này!</span>}
                    </div>
                    <div className="leading-relaxed">
                        {resultData?.solution || (resultData ?
                            <span className="italic text-slate-500">Không có lời giải chi tiết.</span> : <span
                                className="italic text-slate-400">Hệ thống không hiển thị đáp án cho câu hỏi chưa làm.</span>)}
                    </div>
                </motion.div>
            )}
        </div>
    );
});

export default QuestionItem;