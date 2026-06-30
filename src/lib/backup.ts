import { exec } from 'child_process'
import { promisify } from 'util'
import { promises as fs } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

const execAsync = promisify(exec)

/**
 * Service de sauvegarde de la base de données
 */

/**
 * Créer une sauvegarde de la base de données
 */
export async function createDatabaseBackup(): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(process.cwd(), 'backups')
    const backupFileName = `backup-${timestamp}.sql`
    const backupFilePath = path.join(backupDir, backupFileName)

    // Créer le répertoire de sauvegarde s'il n'existe pas
    await fs.mkdir(backupDir, { recursive: true })

    // Récupérer les informations de connexion depuis les variables d'environnement
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return { success: false, error: 'DATABASE_URL non défini' }
    }

    // Extraire les informations de connexion
    const url = new URL(databaseUrl)
    const host = url.hostname
    const port = url.port || '5432'
    const database = url.pathname.slice(1)
    const user = url.username
    const password = url.password

    // Construire la commande pg_dump
    const pgDumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f "${backupFilePath}"`

    // Exécuter la commande de sauvegarde
    await execAsync(pgDumpCommand)

    // Compresser le fichier de sauvegarde
    const compressedFileName = `backup-${timestamp}.sql.gz`
    const compressedFilePath = path.join(backupDir, compressedFileName)
    await execAsync(`gzip "${backupFilePath}"`)

    // Nettoyer les anciennes sauvegardes (garder les 30 dernières)
    await cleanupOldBackups(backupDir, 30)

    return {
      success: true,
      filePath: compressedFilePath,
    }
  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Nettoyer les anciennes sauvegardes
 */
async function cleanupOldBackups(backupDir: string, keepCount: number): Promise<void> {
  try {
    const files = await fs.readdir(backupDir)
    const backupFiles = files.filter((file) => file.startsWith('backup-') && file.endsWith('.sql.gz'))
    
    // Trier les fichiers par date de modification (plus récent en premier)
    const filesWithStats = await Promise.all(
      backupFiles.map(async (file) => {
        const filePath = path.join(backupDir, file)
        const stats = await fs.stat(filePath)
        return { file, stats }
      })
    )
    
    filesWithStats.sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs)
    
    // Supprimer les fichiers les plus anciens
    const filesToDelete = filesWithStats.slice(keepCount)
    await Promise.all(
      filesToDelete.map(async ({ file }) => {
        await fs.unlink(path.join(backupDir, file))
      })
    )
  } catch (error) {
    console.error('Erreur lors du nettoyage des anciennes sauvegardes:', error)
  }
}

/**
 * Restaurer une sauvegarde de la base de données
 */
export async function restoreDatabaseBackup(backupFilePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return { success: false, error: 'DATABASE_URL non défini' }
    }

    // Extraire les informations de connexion
    const url = new URL(databaseUrl)
    const host = url.hostname
    const port = url.port || '5432'
    const database = url.pathname.slice(1)
    const user = url.username
    const password = url.password

    // Décompresser le fichier si nécessaire
    if (backupFilePath.endsWith('.gz')) {
      await execAsync(`gunzip -k "${backupFilePath}"`)
      backupFilePath = backupFilePath.replace('.gz', '')
    }

    // Construire la commande psql
    const psqlCommand = `PGPASSWORD="${password}" psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${backupFilePath}"`

    // Exécuter la commande de restauration
    await execAsync(psqlCommand)

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la restauration de la sauvegarde:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Lister toutes les sauvegardes
 */
export async function listBackups(): Promise<Array<{ fileName: string; size: number; createdAt: Date }>> {
  try {
    const backupDir = path.join(process.cwd(), 'backups')
    await fs.mkdir(backupDir, { recursive: true })

    const files = await fs.readdir(backupDir)
    const backupFiles = files.filter((file) => file.startsWith('backup-') && file.endsWith('.sql.gz'))

    const backups = await Promise.all(
      backupFiles.map(async (file) => {
        const filePath = path.join(backupDir, file)
        const stats = await fs.stat(filePath)
        return {
          fileName: file,
          size: stats.size,
          createdAt: stats.mtime,
        }
      })
    )

    // Trier par date de création (plus récent en premier)
    backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return backups
  } catch (error) {
    console.error('Erreur lors de la liste des sauvegardes:', error)
    return []
  }
}

/**
 * Supprimer une sauvegarde
 */
export async function deleteBackup(fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const backupDir = path.join(process.cwd(), 'backups')
    const filePath = path.join(backupDir, fileName)

    await fs.unlink(filePath)

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la suppression de la sauvegarde:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
