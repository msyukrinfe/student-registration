import React, { useRef, useState } from 'react';
import { RegistrationRecord, Course, SystemSettings, Student, EducationLevel } from '../types';
import { EDUCATION_LEVELS } from '../data/initialData';
import { Download, Printer, Check, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface RegistrationDocumentProps {
  record: RegistrationRecord;
  student?: Student;
  allCoursesForLevel: Course[];
  settings: SystemSettings;
  onClose?: () => void;
  hideActionToolbar?: boolean;
}

export const RegistrationDocument: React.FC<RegistrationDocumentProps> = ({
  record,
  student,
  allCoursesForLevel,
  settings,
  onClose,
  hideActionToolbar = false,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const levelConfig = EDUCATION_LEVELS.find((l) => l.id === record.level) || EDUCATION_LEVELS[2];

  // Group all available courses for this level into compulsory and elective
  const compulsoryCourses = allCoursesForLevel.filter((c) => c.category === 'compulsory').sort((a, b) => a.orderNumber - b.orderNumber);
  const electiveCourses = allCoursesForLevel.filter((c) => c.category === 'elective').sort((a, b) => a.orderNumber - b.orderNumber);

  // Determine row count for electives to match the original scanned form
  // ประถมศึกษา: at least 6 rows
  // ม.ต้น: at least 6 rows
  // ม.ปลาย: at least 11 rows
  const minElectiveRows = record.level === 'senior_high' ? 11 : 6;
  const electiveRowsCount = Math.max(electiveCourses.length, minElectiveRows);

  // Current date in Thai format (Requirement 3: ช่อง วัน เดือน ปี ที่บันทึกข้อมูล ให้ลงวันที่ปัจจุบัน)
  const now = new Date();
  const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const currentDay = record.recordDate?.day || String(now.getDate());
  const currentMonth = record.recordDate?.month || THAI_MONTHS[now.getMonth()];
  const currentYear = record.recordDate?.year || String(now.getFullYear() + 543);

  // Student ID digits formatted into array of 13 boxes (or 10)
  const studentId = record.studentId || student?.id || '';
  const idDigits = studentId.replace(/\D/g, '').padEnd(10, ' ').split('');
  // If id is 10 digits, we can display 10 boxes, or 13 boxes like Thai citizen/student ID standard
  const boxCount = idDigits.length > 10 ? 13 : 10;
  const paddedDigits = Array.from({ length: boxCount }, (_, i) => idDigits[i] || '');

  // Calculate registered credits
  const totalCredits = record.items.reduce((sum, item) => {
    if (item.isRegistered) {
      return sum + Number(item.credits || 0);
    }
    return sum;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    try {
      setIsGeneratingPdf(true);

      // Render canvas with high DPI scale
      const canvas = await html2canvas(documentRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      // Standard A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8;
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, Math.min(imgHeight, pdfHeight - margin * 2));

      const safeName = (record.studentName || 'student').replace(/\s+/g, '_');
      const filename = `ใบลงทะเบียน_${levelConfig.shortName}_${safeName}_${record.term}_${record.academicYear}.pdf`;
      pdf.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF สามารถใช้ปุ่ม "พิมพ์เอกสาร" เพื่อบันทึกเป็น PDF ได้เช่นกัน');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full">
      {/* Top action bar (Screen only) */}
      {!hideActionToolbar && (
        <div className="no-print bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700">
              <Eye className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                ตัวอย่างแบบฟอร์ม: {levelConfig.documentTitle}
              </h3>
              <p className="text-xs text-slate-500">
                นักศึกษา: {record.studentName} ({record.studentId}) · ภาคเรียนที่ {record.term}/{record.academicYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              พิมพ์เอกสาร (Print)
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg shadow-sm transition-colors"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  ดาวน์โหลดสำเร็จ!
                </>
              ) : isGeneratingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังสร้าง PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  ดาวน์โหลดเป็นไฟล์ PDF
                </>
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            )}
          </div>
        </div>
      )}

      {/* Printable Sheet (Exact replica of the scanned document - Single A4 Page) */}
      <div className="flex justify-center bg-transparent p-0 print:p-0 overflow-visible">
        <div
          ref={documentRef}
          className="printable-a4-sheet bg-white text-black font-sarabun text-[12px] leading-[1.3] shadow-md print:shadow-none mx-auto box-border"
          style={{
            width: '210mm',
            height: '297mm',
            maxHeight: '297mm',
            padding: '10mm 14mm 8mm 14mm',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* Header Title */}
          <div className="text-center font-bold text-[18px] tracking-wide mb-3">
            {levelConfig.documentTitle}
          </div>

          {/* Institution & Metadata lines */}
          <div className="space-y-1 mb-2 text-[13.5px]">
            <div className="flex items-baseline">
              <span className="font-semibold whitespace-nowrap">ชื่อสถานศึกษา</span>
              <span className="ml-2 font-normal">{settings.institutionName}</span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[13px]">
              <div>
                <span className="font-semibold">ระดับ</span>
                <span className="ml-1.5 underline decoration-dotted underline-offset-4">{levelConfig.shortName}</span>
              </div>
              <div>
                <span className="font-semibold">ภาคเรียนที่</span>
                <span className="ml-1.5 underline decoration-dotted underline-offset-4">{record.term}</span>
              </div>
              <div>
                <span className="font-semibold">ปีการศึกษา</span>
                <span className="ml-1.5 underline decoration-dotted underline-offset-4">{record.academicYear}</span>
              </div>
              <div>
                <span className="font-semibold">กลุ่ม</span>
                <span className="ml-1.5 underline decoration-dotted underline-offset-4">{record.groupName}</span>
              </div>
              <div>
                <span className="font-semibold">รหัสกลุ่ม</span>
                <span className="ml-1.5 underline decoration-dotted underline-offset-4">{record.groupCode}</span>
              </div>
            </div>

            <div className="flex items-baseline">
              <span className="font-semibold whitespace-nowrap">ชื่อ – ชื่อสกุล</span>
              <span className="ml-2 underline decoration-dotted underline-offset-4 flex-1">
                {record.studentName}
              </span>
            </div>
          </div>

          {/* Student ID Digit Boxes */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-[13px] whitespace-nowrap">รหัสประจำตัวนักศึกษา</span>
            <div className="flex items-center">
              {paddedDigits.map((digit, idx) => (
                <div
                  key={idx}
                  className="w-5 h-6 border border-black flex items-center justify-center font-bold text-[13px] -ml-[1px] first:ml-0"
                >
                  {digit !== ' ' ? digit : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Official Course Registration Table */}
          <table className="w-full border-collapse border border-black text-[12px] leading-tight">
            <thead>
              <tr className="bg-white">
                <th className="border border-black px-1 py-1.5 font-bold text-center w-[36px]">ที่</th>
                <th className="border border-black px-2 py-1.5 font-bold text-center">สาระการเรียนรู้</th>
                <th className="border border-black px-1.5 py-1.5 font-bold text-center w-[76px]">รหัสวิชา</th>
                <th className="border border-black px-1 py-1.5 font-bold text-center w-[66px]">
                  จำนวน<br />หน่วยกิต
                </th>
                <th className="border border-black px-1 py-1.5 font-bold text-center w-[62px]">ลงทะเบียน</th>
                <th className="border border-black px-1 py-1.5 font-bold text-center w-[60px]">เทียบโอน</th>
                <th className="border border-black px-1 py-1.5 font-bold text-center w-[74px]">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {/* Section: วิชาบังคับ */}
              <tr>
                <td colSpan={7} className="border border-black px-2 py-1 bg-white font-bold text-center text-[12.5px]">
                  วิชาบังคับ
                </td>
              </tr>
              {compulsoryCourses.map((course, idx) => {
                const regItem = record.items.find((item) => item.courseCode === course.code || item.courseId === course.id);
                const isReg = regItem?.isRegistered;
                const isTrans = regItem?.isTransferred;
                const note = regItem?.remarks || '';

                return (
                  <tr key={`comp-${course.id}`} className="h-[21px]">
                    <td className="border border-black px-1 py-0.5 text-center font-medium">{idx + 1}</td>
                    <td className="border border-black px-2 py-0.5 text-left">{course.name}</td>
                    <td className="border border-black px-1 py-0.5 text-center">{course.code}</td>
                    <td className="border border-black px-1 py-0.5 text-center">{course.credits}</td>
                    <td className="border border-black px-1 py-0.5 text-center font-bold">
                      {isReg ? '✓' : ''}
                    </td>
                    <td className="border border-black px-1 py-0.5 text-center font-bold">
                      {isTrans ? '✓' : ''}
                    </td>
                    <td className="border border-black px-1 py-0.5 text-center text-[11px] truncate max-w-[74px]">
                      {note}
                    </td>
                  </tr>
                );
              })}

              {/* Section: วิชาเลือกเสรี */}
              <tr>
                <td colSpan={7} className="border border-black px-2 py-1 bg-white font-bold text-center text-[12.5px]">
                  วิชาเลือกเสรี
                </td>
              </tr>
              {Array.from({ length: electiveRowsCount }).map((_, idx) => {
                const course = electiveCourses[idx];
                const regItem = course
                  ? record.items.find((item) => item.courseCode === course.code || item.courseId === course.id)
                  : undefined;
                const isReg = regItem?.isRegistered;
                const isTrans = regItem?.isTransferred;
                const note = regItem?.remarks || '';

                return (
                  <tr key={`elec-${idx}`} className="h-[21px]">
                    <td className="border border-black px-1 py-0.5 text-center font-medium">
                      {idx + 1}
                    </td>
                    <td className="border border-black px-2 py-0.5 text-left">
                      {course ? course.name : ''}
                    </td>
                    <td className="border border-black px-1 py-0.5 text-center">
                      {course ? course.code : ''}
                    </td>
                    <td className="border border-black px-1 py-0.5 text-center">
                      {course ? course.credits : ''}
                    </td>
                    <td className="border border-black px-1 py-0.5 text-center font-bold">
                      {isReg ? '✓' : ''}
                    </td>
                    <td className="border border-black px-1 py-0.5 text-center font-bold">
                      {isTrans ? '✓' : ''}
                    </td>
                    <td className="border border-black px-1 py-0.5 text-center text-[11px] truncate max-w-[74px]">
                      {note}
                    </td>
                  </tr>
                );
              })}

              {/* Total credits summary row */}
              <tr className="font-bold bg-white">
                <td colSpan={4} className="border border-black px-2 py-1.5 text-center">
                  รวม
                </td>
                <td className="border border-black px-1 py-1.5 text-center">
                  {totalCredits > 0 ? totalCredits : ''}
                </td>
                <td colSpan={2} className="border border-black px-2 py-1.5 text-center">
                  หน่วยกิต
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signatures Footer (Identical to original scanned document layout) */}
          <div className="mt-7 text-[12.5px] leading-relaxed">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {/* Left Column: นักศึกษา & ครู */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline">
                    <span className="whitespace-nowrap">ลงชื่อ</span>
                    <span className="border-b border-dotted border-black flex-1 mx-1 text-center font-medium">
                      {record.status !== 'draft' ? record.studentSignatureName || record.studentName : ''}
                    </span>
                    <span className="whitespace-nowrap">นักศึกษา</span>
                  </div>
                  <div className="text-center mt-0.5">
                    ({record.studentSignatureName || record.studentName})
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline">
                    <span className="whitespace-nowrap">ลงชื่อ</span>
                    <span className="border-b border-dotted border-black flex-1 mx-1 text-center font-medium">
                      {record.status === 'approved' || record.status === 'recorded'
                        ? record.teacherSignatureName || student?.advisorName || 'ครูที่ปรึกษา'
                        : ''}
                    </span>
                    <span className="whitespace-nowrap">ครู</span>
                  </div>
                  <div className="text-center mt-0.5">
                    ({record.teacherSignatureName || student?.advisorName || 'ครูประจำกลุ่ม'})
                  </div>
                </div>
              </div>

              {/* Right Column: เจ้าหน้าที่ทะเบียน & วันที่บันทึกข้อมูล */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline">
                    <span className="whitespace-nowrap">ลงชื่อ</span>
                    <span className="border-b border-dotted border-black flex-1 mx-1 text-center font-medium">
                      {record.status === 'recorded'
                        ? record.registrarSignatureName || settings.defaultRegistrarName
                        : ''}
                    </span>
                    <span className="whitespace-nowrap">เจ้าหน้าที่ทะเบียน</span>
                  </div>
                  <div className="text-center mt-0.5">
                    ({record.registrarSignatureName || settings.defaultRegistrarName})
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span>วันที่</span>
                    <span className="border-b border-dotted border-black w-9 text-center font-medium">
                      {currentDay}
                    </span>
                    <span>เดือน</span>
                    <span className="border-b border-dotted border-black w-24 text-center font-medium">
                      {currentMonth}
                    </span>
                    <span>พ.ศ.</span>
                    <span className="border-b border-dotted border-black w-14 text-center font-medium">
                      {currentYear}
                    </span>
                    <span className="whitespace-nowrap ml-1 font-medium">บันทึกข้อมูล</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
