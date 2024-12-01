import { Injectable } from '@nestjs/common';
import { CreateChartDto } from './dto/create-chart.dto';
import { UpdateChartDto } from './dto/update-chart.dto';

@Injectable()
export class ChartService {
  create(createChartDto: CreateChartDto) {
    return `This action updates a \`createChartDto\` #${createChartDto} chart`;
  }

  findAll() {
    return `This action returns all chart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chart`;
  }

  update(id: number, updateChartDto: UpdateChartDto) {
    return `This action updates a \`updateChartDto\` #${updateChartDto} with \`id\` = ${id} chart`;
  }

  remove(id: number) {
    return `This action removes a #${id} chart`;
  }
}