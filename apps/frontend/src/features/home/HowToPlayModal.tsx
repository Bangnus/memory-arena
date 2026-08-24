'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IHowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: IHowToPlayModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            className="max-w-2xl w-full max-h-[85vh] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border-2 border-white/60 shadow-2xl p-6 sm:p-7 text-slate-900 flex flex-col relative overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 text-white flex items-center justify-center shadow-lg transform -rotate-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black font-orbitron text-slate-900 tracking-wide">
                  HOW TO PLAY
                </h3>
                <p className="text-xs font-semibold text-purple-600">กติกาและวิธีการเล่น Memory Arena 🎮</p>
              </div>
            </div>

            {/* Scrollable Rules Content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1.5 space-y-4 text-xs sm:text-sm">
              {/* 1. Format Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-sky-500/10 border border-purple-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-orbitron font-black text-sm">
                  2P
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">รูปแบบการแข่งขัน: Best of 3 (ชนะ 2 ใน 3 รอบ)</div>
                  <div className="text-slate-600 text-xs">ผู้เล่น 2 คนแข่งขันความจำและความเร็วแบบ Realtime ผ่านปุ่มฮาร์ดแวร์ IoT</div>
                </div>
              </div>

              {/* 2. Step by Step Guide */}
              <div className="space-y-2.5">
                <div className="font-orbitron font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>ขั้นตอนการเล่น (3 ขั้นตอน)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Step 1 */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-orbitron font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
                        1
                      </div>
                      <div className="font-bold text-slate-800 text-xs">จำโจทย์ไฟ LED</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        สัญญาณไฟ 4 สีจะกะพริบตามลำดับ <span className="text-rose-500 font-bold">ห้ามกดปุ่มระหว่างแสดงโจทย์</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-orbitron font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
                        2
                      </div>
                      <div className="font-bold text-slate-800 text-xs">กดตอบตามลำดับ</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        เมื่อโจทย์จบ ให้กดปุ่ม 🔴 🟢 🔵 🟡 ตามลำดับที่จำได้ทีละปุ่มให้เร็วที่สุด
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-orbitron font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
                        3
                      </div>
                      <div className="font-bold text-slate-800 text-xs">ผู้ชนะในรอบ</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        คนที่กด<span className="text-emerald-600 font-bold">ถูกต้องครบก่อน</span>จะได้ 1 แต้มในรอบนั้นทันที
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Important Rules & Penalties */}
              <div className="space-y-2">
                <div className="font-orbitron font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>กฎสำคัญและเงื่อนไขแพ้-ชนะ</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
                  <div className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">⚠️</span>
                    <span><strong>กดผิดแพ้ทันที (Instant Loss):</strong> หากกดผิดลำดับจากโจทย์ จะถูกปรับแพ้ในรอบนั้นทันที และให้อีกฝั่งได้คะแนน</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">⏱️</span>
                    <span><strong>เวลาตอบ 15 วินาที:</strong> หากหมดเวลาหรือกดผิดทั้งคู่ รอบนั้นจะถือเป็นโมฆะ (Draw) และสุ่มโจทย์ใหม่เริ่มรอบนั้นใหม่อีกครั้ง</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">⚡</span>
                    <span><strong>ห้ามกดค้าง/พร้อมกัน:</strong> ระบบรับข้อมูลแบบ Single-press ทีละปุ่มเพื่อความแม่นยำ</span>
                  </div>
                </div>
              </div>

              {/* 4. Difficulty Modes */}
              <div className="space-y-2 pb-2">
                <div className="font-orbitron font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>ระดับความยาก (3 ระดับ)</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="font-black text-emerald-700 font-orbitron">EASY</div>
                    <div className="text-[11px] text-slate-600 font-medium">3 ลำดับ (0.8s)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="font-black text-amber-700 font-orbitron">MEDIUM</div>
                    <div className="text-[11px] text-slate-600 font-medium">4 ลำดับ (0.65s)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="font-black text-rose-700 font-orbitron">HARD</div>
                    <div className="text-[11px] text-slate-600 font-medium">6 ลำดับ (0.45s)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button at bottom */}
            <div className="pt-3 shrink-0">
              <Button
                onClick={onClose}
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-orbitron font-black text-xs sm:text-sm shadow-md hover:scale-101 active:scale-99 transition-all cursor-pointer"
              >
                GOT IT! • เข้าใจแล้ว
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
