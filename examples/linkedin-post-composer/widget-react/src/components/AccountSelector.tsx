import { User, Building2, ChevronDown } from "lucide-react";

interface Account {
  id: string;
  name: string;
  profileUrl?: string;
  pageUrl?: string;
}

interface AccountSelectorProps {
  accounts: {
    personal: Account;
    organizations: Account[];
  };
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
}

export function AccountSelector({ accounts, selectedAccountId, onSelectAccount }: AccountSelectorProps) {
  const allAccounts = [accounts.personal, ...accounts.organizations];
  const selectedAccount = allAccounts.find(acc => acc.id === selectedAccountId) || accounts.personal;
  const isPersonal = selectedAccountId === accounts.personal.id;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Post as
      </label>
      <div className="relative">
        <select
          value={selectedAccountId}
          onChange={(e) => onSelectAccount(e.target.value)}
          className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none cursor-pointer hover:border-linkedin-500 dark:hover:border-linkedin-400 focus:outline-none focus:ring-2 focus:ring-linkedin-500 dark:focus:ring-linkedin-400 transition-colors"
        >
          <option value={accounts.personal.id}>
            {accounts.personal.name} (Personal)
          </option>
          {accounts.organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} (Company Page)
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
          {isPersonal ? (
            <User className="w-4 h-4 text-gray-400" />
          ) : (
            <Building2 className="w-4 h-4 text-gray-400" />
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {selectedAccount.name}
      </p>
    </div>
  );
}
