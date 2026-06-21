export class Child {
  id: string;
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  avatar: string;
  bloodType?: string;
  weight?: number;
  height?: number;

  constructor(data: ChildData) {
    this.id = data.id;
    this.name = data.name;
    this.birthDate = data.birthDate;
    this.gender = data.gender;
    this.avatar = data.avatar;
    this.bloodType = data.bloodType;
    this.weight = data.weight;
    this.height = data.height;
  }

  getAgeInMonths(): number {
    const birth = new Date(this.birthDate + 'T12:00:00');
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) months--;
    return years * 12 + months;
  }

  getFormattedAge(): string {
    const months = this.getAgeInMonths();
    if (months < 0) return 'Ainda não nascido';
    if (months === 0) {
      const birth = new Date(this.birthDate + 'T12:00:00');
      const now = new Date();
      const days = Math.ceil(Math.abs(now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
    if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (rem === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    return `${years} ${years === 1 ? 'ano' : 'anos'} e ${rem} ${rem === 1 ? 'mês' : 'meses'}`;
  }

  getFormattedBirthDate(): string {
    const [y, m, d] = this.birthDate.split('-');
    return `${d}/${m}/${y}`;
  }

  getGenderLabel(): string {
    return this.gender === 'F' ? 'Feminino' : 'Masculino';
  }
}

export interface ChildData {
  id: string;
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  avatar: string;
  bloodType?: string;
  weight?: number;
  height?: number;
}
