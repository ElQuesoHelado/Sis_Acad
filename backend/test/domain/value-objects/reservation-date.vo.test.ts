import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReservationDate } from "@/domain/value-objects/reservation-date.vo.js";
import {
  InvalidReservationDateError,
  ReservationWindowError,
} from "@/domain/errors/validation.errors.js";

const MOCK_TODAY_ISO = "2025-11-05T10:00:00.000Z";
const NORMALIZED_TODAY = "2025-11-05";

const MAX_VALID_DATE = "2025-11-19";

const YESTERDAY = "2025-11-04";
const TOO_FAR_DATE = "2025-11-20";
const VALID_FUTURE_DATE = "2025-11-15";
// ---

describe("ReservationDate VO (con Lógica de Ventana de Tiempo)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_TODAY_ISO));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Validación de Formato y Realidad", () => {
    it("debería lanzar InvalidReservationDateError por formato incorrecto (slashes)", () => {
      const invalidString = "2025/11/20";
      const act = () => ReservationDate.create(invalidString);
      expect(act).toThrow(InvalidReservationDateError);
      expect(act).toThrow("Date must be a valid YYYY-MM-DD string.");
    });

    it("debería lanzar InvalidReservationDateError por formato incorrecto (DD-MM-YYYY)", () => {
      const invalidString = "20-11-2025";
      const act = () => ReservationDate.create(invalidString);
      expect(act).toThrow(InvalidReservationDateError);
      expect(act).toThrow("Date must be a valid YYYY-MM-DD string.");
    });

    it("debería lanzar InvalidReservationDateError por una fecha no existente (30 de Feb)", () => {
      const invalidString = "2025-02-30";
      const act = () => ReservationDate.create(invalidString);
      expect(act).toThrow(InvalidReservationDateError);
      expect(act).toThrow(
        "Invalid date components: '2025-02-30' is not a real date.",
      );
    });

    it("debería lanzar InvalidReservationDateError por un día bisiesto inexistente (2025 no es bisiesto)", () => {
      const invalidString = "2025-02-29";
      const act = () => ReservationDate.create(invalidString);
      expect(act).toThrow(InvalidReservationDateError);
      expect(act).toThrow(
        "Invalid date components: '2025-02-29' is not a real date.",
      );
    });

    it("debería crear la fecha correctamente en un año bisiesto", () => {
      vi.setSystemTime(new Date("2024-02-15T10:00:00.000Z"));
      const leapDateString = "2024-02-29";
      const vo = ReservationDate.create(leapDateString);
      expect(vo.isoString).toBe(leapDateString);
      expect(vo.value.getUTCDate()).toBe(29);
      expect(vo.value.getUTCMonth()).toBe(1);
    });
  });

  describe("Validación de Ventana de Tiempo (Reglas de Negocio)", () => {
    it("debería crear una fecha válida si es HOY", () => {
      const vo = ReservationDate.create(NORMALIZED_TODAY);
      expect(vo).toBeInstanceOf(ReservationDate);
      expect(vo.isoString).toBe(NORMALIZED_TODAY);
    });

    it("debería crear una fecha válida si está dentro de la ventana de 14 días", () => {
      const vo = ReservationDate.create(VALID_FUTURE_DATE);
      expect(vo).toBeInstanceOf(ReservationDate);
      expect(vo.isoString).toBe(VALID_FUTURE_DATE);
    });

    it("debería crear una fecha válida si es EXACTAMENTE en 14 días (límite)", () => {
      const vo = ReservationDate.create(MAX_VALID_DATE);
      expect(vo).toBeInstanceOf(ReservationDate);
      expect(vo.isoString).toBe(MAX_VALID_DATE);
    });

    it("debería lanzar ReservationWindowError si la fecha es en el pasado (ayer)", () => {
      const act = () => ReservationDate.create(YESTERDAY);
      expect(act).toThrow(ReservationWindowError);
      expect(act).toThrow("Cannot create reservations in the past.");
    });

    it("debería lanzar ReservationWindowError si la fecha es muy lejana (15 días)", () => {
      const act = () => ReservationDate.create(TOO_FAR_DATE);
      expect(act).toThrow(ReservationWindowError);
      expect(act).toThrow(
        "Reservations can only be made up to 14 days in advance.",
      );
    });
  });

  describe("Métodos de Instancia", () => {
    let vo: ReservationDate;
    beforeEach(() => {
      vo = ReservationDate.create(NORMALIZED_TODAY);
    });

    it("value debería ser un objeto Date normalizado a UTC midnight", () => {
      const expectedDate = new Date("2025-11-05T00:00:00.000Z");
      expect(vo.value).toBeInstanceOf(Date);
      expect(vo.value.getTime()).toBe(expectedDate.getTime());
      expect(vo.value.getUTCHours()).toBe(0);
    });

    it("isoString debería ser el string original", () => {
      expect(vo.isoString).toBe(NORMALIZED_TODAY);
    });

    it("equals() debería devolver true para fechas idénticas", () => {
      const vo1 = ReservationDate.create(NORMALIZED_TODAY);
      const vo2 = ReservationDate.create(NORMALIZED_TODAY);
      expect(vo1.equals(vo2)).toBe(true);
    });

    it("equals() debería devolver false para fechas diferentes", () => {
      const vo1 = ReservationDate.create(NORMALIZED_TODAY);
      const vo2 = ReservationDate.create(VALID_FUTURE_DATE);
      expect(vo1.equals(vo2)).toBe(false);
    });

    it("toDate() debería devolver el objeto Date interno", () => {
      expect(vo.toDate()).toBe(vo.value);
    });

    it("toString() debería devolver el string ISO (YYYY-MM-DD)", () => {
      expect(vo.toString()).toBe(vo.isoString);
    });
  });
});
