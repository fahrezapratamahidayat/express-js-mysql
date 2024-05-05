import { Request, Response } from "express"
import fs from "fs"
const provinsi = JSON.parse(fs.readFileSync("./app/utils/provinsi.json", "utf8"))
const kabupaten = JSON.parse(fs.readFileSync("./app/utils/kabupaten.json", "utf8"))
const kecamatan = JSON.parse(fs.readFileSync("./app/utils/kecamatan.json", "utf8"))
const desa = JSON.parse(fs.readFileSync("./app/utils/kelurahan.json", "utf8"))

export const getProvinsi = async (req: Request, res: Response) => {
    res.json(provinsi)
}

export const getKabupaten = async (req: Request, res: Response) => {
    const { provinsiId } = req.params;
    if (!provinsiId) {
        return res.status(400).json({ message: "Provinsi ID is required" });
    }
    const filteredKabupaten = kabupaten.filter((kab: any) => kab.provinsi_id === parseInt(provinsiId));
    res.json(filteredKabupaten);
}

export const getKecamatan = async (req: Request, res: Response) => {
    const { kabupatenId } = req.params;
    if (!kabupatenId) {
        return res.status(400).json({ message: "Kabupaten ID is required" });
    }
    const filteredKecamatan = kecamatan.filter((kec: any) => kec.kabupaten_id === parseInt(kabupatenId));
    res.json(filteredKecamatan);
}

export const getKelurahan = async (req: Request, res: Response) => {
    const { kecamatanId } = req.params;
    if (!kecamatanId) {
        return res.status(400).json({ message: "Kecamatan ID is required" });
    }
    const filteredDesa = desa.filter((d: any) => d.kecamatan_id === parseInt(kecamatanId));
    res.json(filteredDesa);
}