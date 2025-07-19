import { doc, getDoc, runTransaction, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import Formatting from "../../utils/format/Formatting";

export default class CounterRepository {
static async previewNextCode(prefix, uniqueType = "number", monthFormat = "number", yearFormat = "twoletter") {
  const formattingCode = this.formatCode(prefix, null, uniqueType, monthFormat, yearFormat);
  const counterRef = doc(db, "Counters", formattingCode);
  const counterSnap = await getDoc(counterRef);

  let last = 1;
  if (counterSnap.exists()) {
    const data = counterSnap.data();
    if (data && typeof data.last === 'number') {
      last = data.last + 1;
    }
  }

  console.log('Last From Preview: ', last);

  return this.formatCode(prefix, last, uniqueType, monthFormat, yearFormat);
}


  static checkIfCodeExists = async (collection, code) => {
    const docRef = doc(db, collection, code);
    const snapshot = await getDoc(docRef);
    return snapshot.exists();
  };


  static async getNextCode(prefix, uniqueType = "number", monthFormat = "number", yearFormat = "twoletter") {
    const formattingCode = this.formatCode(prefix, null, uniqueType, monthFormat, yearFormat);
    const counterRef = doc(db, "Counters", formattingCode);

    const nextCode = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let last = 0;

      if (!counterDoc.exists()) {
        transaction.set(counterRef, { last: 1 });
        last = 1;
      } else {
        last = counterDoc.data().last + 1;
        transaction.update(counterRef, { last });
      }

      return this.formatCode(prefix, last + 1, uniqueType, monthFormat, yearFormat);
    });

    return nextCode;
  }

  static async commitNextCode(formattingCode, lastValue) {
    const counterRef = doc(db, "Counters", formattingCode);
    await setDoc(counterRef, { last: lastValue }, { merge: true });
  }


  static async getAvailableNextCode(
    prefix,
    uniqueType = "number",
    monthFormat = "number",
    yearFormat = "twoletter",
    targetCollection = "Adjustments",
    maxAttempts = 10
  ) {
    const formattingCode = this.formatCode(prefix, null, uniqueType, monthFormat, yearFormat);
    const counterRef = doc(db, "Counters", formattingCode);

    const counterSnap = await getDoc(counterRef);
    let last = counterSnap.exists() ? counterSnap.data().last : 0;

    for (let i = 0; i < maxAttempts; i++) {
      const candidate = this.formatCode(prefix, last + 1, uniqueType, monthFormat, yearFormat);
      const nextCandidate = this.formatCode(prefix, last + 2, uniqueType, monthFormat, yearFormat);
      const isDuplicate = await this.checkIfCodeExists(targetCollection, candidate);

      if (!isDuplicate) {
        return {
          candidate,
          nextCandidate,
          last: last + 1, // calon nilai yang akan disimpan nanti
          formattingCode
        };
      }

      last++;
    }

    throw new Error("Tidak ada kode tersedia setelah " + maxAttempts + " percobaan.");
  }

  static formatCode(prefix, last, uniqueType = "number", monthFormat = "number", yearFormat = "twoletter") {
    let uniquePart = "";

    if (uniqueType === "number" && last) {
      uniquePart = last.toString().padStart(4, "0");
    } else if (uniqueType === "roman") {
      uniquePart = Formatting.toRoman(last);
    }

    const monthCode = Formatting.getFormattedMonth(null, monthFormat); // ⬅️ Ambil kode bulan
    const yearCode = Formatting.getFormattedYear(null, yearFormat)

    return `${prefix}${yearCode}${monthCode}${uniquePart}`; // Misalnya: ADJG0005
  }
}
