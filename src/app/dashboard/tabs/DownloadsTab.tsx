import type { ReactNode } from 'react';
import {
	Cpu,
	Download,
	Gamepad2,
	Lock,
	Shield,
	type LucideIcon,
} from 'lucide-react';
import { formatSize } from '../format';
import {
	Callout,
	Label,
	SectionTitle,
	primaryButton,
	secondaryButton,
} from '../ui';

export interface ReleaseInfo {
	version: string;
	size: number | null;
	updatedAt?: string | null;
}

export interface BiosAsset {
	id: string;
	file_size: number | null;
}

function DownloadItem({
	icon: Icon,
	name,
	tag,
	description,
	install,
	meta,
	children,
}: {
	icon: LucideIcon;
	name: string;
	tag: string;
	description: string;
	install: ReactNode;
	meta: string[];
	children: ReactNode;
}) {
	return (
		<article className="flex flex-col rounded-lg border border-border bg-card/40 p-6">
			<div className="flex items-center justify-between gap-4">
				<Label icon={Icon}>{tag}</Label>
				{meta.length > 0 && (
					<span className="font-mono text-[11px] text-muted-foreground">
						{meta.join(' · ')}
					</span>
				)}
			</div>
			<h3 className="mt-3 font-display text-xl font-bold text-foreground">
				{name}
			</h3>
			<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
				{description}
			</p>
			<div className="mt-5 border-l-2 border-border pl-4">
				<Label>Como instalar</Label>
				<p className="mt-1 text-xs leading-relaxed text-foreground/80">
					{install}
				</p>
			</div>
			<div className="mt-auto pt-6">{children}</div>
		</article>
	);
}

export function DownloadsTab({
	release,
	bios,
	hasAccess,
	pending,
	onBios,
	onCheckout,
}: {
	release: ReleaseInfo | null;
	bios: BiosAsset | null;
	hasAccess: boolean;
	pending: string | null;
	onBios: () => void;
	onCheckout: () => void;
}) {
	return (
		<div className="space-y-6">
			<SectionTitle
				title="Downloads"
				description="O aplicativo RIESCADE para Windows e o pack completo de BIOS para os emuladores."
			/>

			<div className="grid gap-4 md:grid-cols-2">
				<DownloadItem
					icon={Gamepad2}
					tag="Aplicativo oficial"
					name="RIESCADE"
					description="EmulationStation com catálogo na nuvem, emuladores pré-configurados, RetroAchievements e atualizações automáticas. Jogo, mídias e emulador são baixados na hora ao iniciar."
					install={
						<>
							Extraia o .7z numa pasta (ex.:{' '}
							<code className="font-mono text-foreground">C:\RIESCADE</code>),
							abra o RetroBat.exe e entre com sua conta Google.
						</>
					}
					meta={[
						release ? `v${release.version}` : '',
						formatSize(release?.size) ?? '',
						'Windows 10/11',
					].filter(Boolean)}
				>
					{release ? (
						<a
							href="/api/app/retrobat/download"
							className={`${primaryButton} w-full`}
						>
							<Download className="h-4 w-4" />
							Baixar RIESCADE
						</a>
					) : (
						<button
							disabled
							className={`${secondaryButton} w-full`}
						>
							Em breve
						</button>
					)}
				</DownloadItem>

				<DownloadItem
					icon={Cpu}
					tag={hasAccess ? 'Membros' : 'Exclusivo para membros'}
					name="Pack de BIOS"
					description="Os arquivos de sistema que os emuladores exigem para PlayStation, Saturn, Dreamcast, Neo Geo e muitos outros, num pacote único pronto para extrair."
					install={
						<>
							Extraia o bios.zip dentro da pasta{' '}
							<code className="font-mono text-foreground">bios</code> do
							RIESCADE. O app também baixa pelo menu RIESCADE → Downloads.
						</>
					}
					meta={['bios.zip', formatSize(bios?.file_size) ?? ''].filter(Boolean)}
				>
					{hasAccess ? (
						<button
							onClick={onBios}
							disabled={!bios || pending === 'bios'}
							className={`${primaryButton} w-full`}
						>
							<Download className="h-4 w-4" />
							{pending === 'bios'
								? 'Liberando...'
								: bios
									? 'Baixar pack de BIOS'
									: 'Carregando...'}
						</button>
					) : (
						<button
							onClick={onCheckout}
							disabled={pending === 'checkout'}
							className={`${secondaryButton} w-full`}
						>
							<Lock className="h-4 w-4" />
							Assinar para liberar
						</button>
					)}
				</DownloadItem>
			</div>

			<Callout
				icon={Shield}
				title={
					hasAccess
						? 'Downloads de jogos ficam dentro do aplicativo'
						: 'O aplicativo é gratuito'
				}
			>
				{hasAccess
					? 'Use sua conta somente nos seus próprios computadores.'
					: 'A assinatura libera os downloads de jogos dentro dele, o pack de BIOS e os temas exclusivos.'}
			</Callout>
		</div>
	);
}
