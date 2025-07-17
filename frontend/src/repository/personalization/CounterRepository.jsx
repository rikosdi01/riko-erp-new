import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "../../firebase";
import Formatting from "../../utils/format/Formatting";

export default class CounterRepository {
  static async previewNextCode(prefix, uniqueType = "number", monthFormat = "number", yearFormat = "twoletter") {
    const formattingCode = this.formatCode(prefix, null, uniqueType, monthFormat, yearFormat)
    const counterRef = doc(db, "Counters", formattingCode);
    const counterSnap = await getDoc(counterRef);

    let last = counterSnap.exists() ? counterSnap.data().last + 1 : 1;

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

      return this.formatCode(prefix, last, uniqueType, monthFormat, yearFormat);
    });

    return nextCode;
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
    console.log('FormattingCode : ', formattingCode);
    const counterRef = doc(db, "Counters", formattingCode);

    let finalCode = "";
    let last = 0;
    let found = false;

    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      last = counterDoc.exists() ? counterDoc.data().last : 0;

      for (let i = 0; i < maxAttempts; i++) {
        last++;
        const candidateCode = this.formatCode(prefix, last, uniqueType, monthFormat, yearFormat);
        const isDuplicate = await this.checkIfCodeExists(targetCollection, candidateCode);

        if (!isDuplicate) {
          transaction.set(counterRef, { last }); // update last used
          finalCode = candidateCode;
          found = true;
          break;
        }
      }

      if (!found) throw new Error("Tidak ada kode tersedia setelah " + maxAttempts + " percobaan.");
    });

    return finalCode;
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
