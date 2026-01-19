import { Wallet } from '@/types';
import { getScore, getBadge } from './scoring';

/**
 * Exports wallet data to CSV format and triggers download
 */
export const exportToCSV = (wallets: Wallet[]): void => {
  // CSV Headers
  const headers = [
    'Address',
    'Score',
    'Status',
    'Role',
    'Role Confidence',
    'Funding Source',
    'Funding Confidence',
    'Total Transactions',
    'Recent (7d)',
    'Age (days)',
    'Balance (SOL)',
  ];

  // CSV Rows
  const rows = wallets.map((wallet) => {
    const score = getScore(wallet);
    const badge = getBadge(score);
    const status = score >= 80 ? 'Clean' : score >= 50 ? 'Medium' : 'Risky';

    // Format role name
    const roleName = wallet.role?.role 
      ? wallet.role.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'N/A';

    return [
      wallet.address,
      score.toString(),
      status,
      roleName,
      wallet.role?.confidence?.toString() || 'N/A',
      wallet.funding?.sourceName || 'N/A',
      wallet.funding?.confidence?.toString() || 'N/A',
      wallet.data?.totalTransactions?.toString() || '0',
      wallet.data?.recentTransactions?.toString() || '0',
      wallet.data?.ageInDays?.toString() || '0',
      wallet.data?.balance || '0',
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `cleanbundle-results-${timestamp}.csv`;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);
};

/**
 * Copies wallet data to clipboard in specified format
 */
export const copyToClipboard = async (
  wallets: Wallet[],
  format: 'markdown' | 'json'
): Promise<void> => {
  let content: string;

  if (format === 'markdown') {
    // Markdown table format
    const headers = '| Address | Score | Status | Role | Funding | TXs | Recent | Age | Balance |';
    const separator = '|---------|-------|--------|------|---------|-----|--------|-----|---------|';
    
    const rows = wallets.map((wallet) => {
      const score = getScore(wallet);
      const badge = getBadge(score);
      const status = score >= 80 ? 'Clean' : score >= 50 ? 'Medium' : 'Risky';
      const shortAddress = `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`;
      const roleName = wallet.role?.role 
        ? wallet.role.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'N/A';

      return `| ${shortAddress} | ${badge.emoji} ${score} | ${status} | ${roleName} | ${wallet.funding?.sourceName || 'N/A'} | ${wallet.data?.totalTransactions || 0} | ${wallet.data?.recentTransactions || 0} | ${wallet.data?.ageInDays || 0}d | ${wallet.data?.balance || 0} SOL |`;
    });

    content = [headers, separator, ...rows].join('\n');
  } else {
    // JSON format
    const data = wallets.map((wallet) => ({
      address: wallet.address,
      score: getScore(wallet),
      role: wallet.role,
      funding: wallet.funding,
      data: wallet.data,
      error: wallet.error,
    }));

    content = JSON.stringify(data, null, 2);
  }

  // Copy to clipboard
  await navigator.clipboard.writeText(content);
};
